FROM php:8.2-cli-alpine

WORKDIR /app

# Install system dependencies and PHP PDO MySQL & Sockets extensions
RUN apk add --no-cache bash git unzip curl linux-headers \
    && docker-php-ext-install pdo pdo_mysql sockets pcntl

# Copy Composer from official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy RoadRunner binary
COPY --from=spiralscout/roadrunner:2023.3 /usr/bin/rr /usr/local/bin/rr

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

EXPOSE 50051 8000

CMD ["sh", "-c", "php -r \"for(;;){if(@fsockopen('mysql-inventory',3306)){echo 'MySQL is ready!\n';break;}echo 'Waiting for MySQL...\n';sleep(2);}\" && php artisan migrate --force && php artisan db:seed --class=InventorySeeder --force && php artisan serve --host=0.0.0.0 --port=8000 & rr serve"]
