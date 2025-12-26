FROM php:8.2-cli

# Install minimal dependencies
RUN apt-get update && apt-get install -y \
    curl unzip sqlite3 libsqlite3-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install PHP extensions  
RUN docker-php-ext-install pdo pdo_sqlite

# Copy backend only
WORKDIR /app
COPY backend ./backend

# Setup Laravel
WORKDIR /app/backend
RUN composer install --no-dev --no-interaction --optimize-autoloader --ignore-platform-reqs
RUN cp .env.example .env || echo "APP_KEY=" > .env
RUN mkdir -p database storage/logs storage/framework/{sessions,views,cache}
RUN chmod -R 777 storage database
RUN touch database/database.sqlite
RUN php artisan key:generate

EXPOSE 7860

# Startup
CMD php artisan migrate --force && php artisan scrape:initial && php artisan serve --host=0.0.0.0 --port=7860
