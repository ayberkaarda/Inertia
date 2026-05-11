<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ObserverMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Kullanıcı giriş yapmışsa ve rolü 'observer' ise
        if (Auth::check() && Auth::user()->role === 'observer') {
            // Sadece okuma (GET) isteklerine izin ver, diğerlerini (POST, PUT, DELETE) engelle
            if (!$request->isMethod('get')) {
                
                // İstisna 1: Logout (Çıkış yapma) işlemine izin ver
                if ($request->routeIs('logout')) {
                    return $next($request);
                }

                // İstisna 2: Chat üzerinden mesaj GÖNDERME işlemine izin ver 💬
                if ($request->routeIs('chat.store')) {
                    return $next($request);
                }
                
                return back()->with('error', 'You are in observer mode. You cant do that! 🛡️');
            }
        }

        return $next($request);
    }
}