<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateProductRequest extends FormRequest
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
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('imageCover') && !$this->has('image_cover')) {
            $this->merge(['image_cover' => $this->input('imageCover')]);
        }

        $imageFile = $this->file('imageCover') ?? $this->file('image_cover');
        if ($imageFile && $imageFile->isValid()) {
            $destinationPath = public_path('uploads/products');
            if (!file_exists($destinationPath)) {
                @mkdir($destinationPath, 0777, true);
            }
            $filename = time() . '_' . uniqid() . '.' . $imageFile->getClientOriginalExtension();
            $imageFile->move($destinationPath, $filename);

            $this->files->remove('image_cover');
            $this->files->remove('imageCover');
            $this->merge(['image_cover' => '/uploads/products/' . $filename]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|min:3|max:100',
            'description' => 'sometimes|required|string|min:20',
            'quantity' => 'sometimes|required|integer|min:0',
            'price' => 'sometimes|required|numeric|min:0|max:200000',
            'image_cover' => 'nullable',
            'category' => 'sometimes|required|string|in:Dairy,Bakery,Beverages,Snacks,Canned,Meat,Poultry,Fruits,Vegetables,Grains,Oils,Pantry,Spices,Cleaning,Household,Personal Care',
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
