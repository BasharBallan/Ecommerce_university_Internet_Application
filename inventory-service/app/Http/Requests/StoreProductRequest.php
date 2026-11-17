<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare inputs before validation.
     * Maps camelCase keys and handles file uploads or fallback defaults.
     */
    protected function prepareForValidation(): void
    {
        // 1. Handle camelCase vs snake_case for imageCover text input
        if ($this->has('imageCover') && !$this->has('image_cover')) {
            $this->merge(['image_cover' => $this->input('imageCover')]);
        }

        // 2. Handle file upload for imageCover / image_cover
        $imageFile = $this->file('imageCover') ?? $this->file('image_cover');
        if ($imageFile && $imageFile->isValid()) {
            $destinationPath = public_path('uploads/products');
            if (!file_exists($destinationPath)) {
                @mkdir($destinationPath, 0777, true);
            }
            $filename = time() . '_' . uniqid() . '.' . $imageFile->getClientOriginalExtension();
            $imageFile->move($destinationPath, $filename);

            // Remove file objects from files bag so they don't override string input in validationData
            $this->files->remove('image_cover');
            $this->files->remove('imageCover');
            $this->merge(['image_cover' => '/uploads/products/' . $filename]);
        }

        // 3. Fallback default image cover if still missing, empty, or not a string
        $currentCover = $this->input('image_cover');
        if (empty($currentCover) || !is_string($currentCover)) {
            $this->files->remove('image_cover');
            $this->files->remove('imageCover');
            $this->merge(['image_cover' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80']);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|min:3|max:100',
            'description' => 'required|string|min:20',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0|max:200000',
            'image_cover' => 'nullable',
            'category' => 'required|string|in:Dairy,Bakery,Beverages,Snacks,Canned,Meat,Poultry,Fruits,Vegetables,Grains,Oils,Pantry,Spices,Cleaning,Household,Personal Care',
            'ratings_average' => 'nullable|numeric|between:1.0,5.0',
            'ratings_quantity' => 'nullable|integer|min:0',
        ];
    }

    /**
     * Custom validation failure response to match uniform JSON format.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status' => 'fail',
            'errors' => $validator->errors(),
        ], 422));
    }
}
