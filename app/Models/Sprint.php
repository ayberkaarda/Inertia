<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Sprint extends Model {
    protected $fillable = ['name', 'status', 'end_date', 'required_skill'];
    
    // Bir sprintin birden çok görevi (Card) olur
    public function tasks() {
        return $this->hasMany(Card::class);
    }
}