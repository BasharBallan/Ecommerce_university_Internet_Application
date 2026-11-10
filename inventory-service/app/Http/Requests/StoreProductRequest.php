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
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|min:3|max:100',
            'description' => 'required|string|min:20',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0|max:200000',
            'image_cover' => 'required|string',
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

