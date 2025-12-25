FROM php:8.2-fpm

# 1. Install System Dependencies (Combined to reduce layers)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    sqlite3 \
    nginx \
    supervisor \
    gnupg \
    dos2unix \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# 2. Install PHP Extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# 3. Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Set Workdir
WORKDIR /app

# 5. Copy Codebase (Everything)
COPY . .

# 6. Setup Backend (Laravel)
WORKDIR /app/backend
RUN composer install --no-interaction --optimize-autoloader
RUN cp .env.example .env
RUN php artisan key:generate

# 7. Setup Worker (Node) - Skip Chromium (HF provides it or we'll use chromium-browser)
WORKDIR /app/worker
RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install
RUN apt-get install -y chromium || echo "Chromium install failed, puppeteer may not work"

# 8. Setup Configs & Scripts
WORKDIR /app
COPY .docker/nginx.conf /etc/nginx/sites-available/default
COPY .docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY .docker/start.sh /start.sh

# 9. Fix Line Endings (CRLF -> LF) & Permissions
RUN dos2unix /start.sh
RUN dos2unix /etc/supervisor/conf.d/supervisord.conf
RUN chmod +x /start.sh

# 10. Create Runtime Directories (Critical for Non-Root/Root compat)
RUN mkdir -p /var/log/nginx /var/lib/nginx /run/php
RUN chown -R www-data:www-data /var/log/nginx /var/lib/nginx /run/php
RUN chown -R www-data:www-data /app/backend/storage /app/backend/database

# 11. Run as Root (Required for HF Spaces to control Nginx/Supervisor)
USER root

EXPOSE 7860

CMD ["/start.sh"]
