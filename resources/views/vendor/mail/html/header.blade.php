@props(['url'])
<tr>
    <td class="header">
        <a href="{{ $url }}" style="display: inline-block;">
            <img src="{{ asset('images/logo.png') }}" alt="{{ config('app.name') }}" style="height: 60px; max-width: 100%; border: none; filter: brightness(1.3) drop-shadow(0 0 10px rgba(168, 85, 247, 0.3));">
        </a>
    </td>
</tr>