<?php

return [
    'paths' => ['api/*', '*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost:8001',
    ],
    'allowed_origins_patterns' => ['#^http://(localhost|127\.0\.0\.1)(:\d+)?$#'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 86400,
    'supports_credentials' => true,
];

