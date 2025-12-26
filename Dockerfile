FROM php:8.2-cli

# Install minimal dependencies
RUN apt-get update && apt-get install -y \
    sqlite3 libsqlite3-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_sqlite

# Copy only backend
WORKDIR /app
COPY backend ./backend
COPY composer.phar /usr/local/bin/composer
RUN chmod +x /usr/local/bin/composer

# Setup Laravel
WORKDIR /app/backend
RUN composer install --no-dev --no-interaction --optimize-autoloader || composer install --ignore-platform-reqs --no-dev --no-interaction
RUN cp .env.example .env || true
RUN mkdir -p database storage/logs storage/framework/{sessions,views,cache}
RUN chmod -R 777 storage database
RUN touch database/database.sqlite
RUN php artisan key:generate || true

EXPOSE 7860

# Simple startup: migrate + serve
CMD php artisan migrate --force && php artisan scrape:initial && php artisan serve --host=0.0.0.0 --port=7860
