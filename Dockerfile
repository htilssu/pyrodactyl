FROM php:8.3-fpm
WORKDIR /app

COPY package.json ./
# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm@10.6.0

RUN pnpm install

COPY .env.example .

# Install dependencies (using apt instead of apk)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    cron \
    default-mysql-client \
    git \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    libpq-dev \
    nginx \
    netcat-openbsd \
    postgresql-client \
    python3-certbot \
    python3-certbot-nginx \
    supervisor \
    tar \
    unzip \
    && docker-php-ext-configure zip \
    && docker-php-ext-install bcmath gd pdo pdo_mysql pdo_pgsql zip \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && mkdir -p bootstrap/cache/ storage/logs storage/framework/sessions storage/framework/views storage/framework/cache \
    && chmod -R 777 bootstrap storage \
    && rm -rf .env bootstrap/cache/*.php \
    && cp .env.example .env \
    && mkdir -p /app/storage/logs/ \
    && chown -R www-data .

COPY . .

RUN composer install --optimize-autoloader

RUN rm /usr/local/etc/php-fpm.conf \
&& echo "* * * * * /usr/local/bin/php /app/artisan schedule:run >> /dev/null 2>&1" >> /var/spool/cron/crontabs/root \
&& echo "0 23 * * * certbot renew --nginx --quiet" >> /var/spool/cron/crontabs/root \
&& sed -i s/ssl_session_cache/#ssl_session_cache/g /etc/nginx/nginx.conf \
&& mkdir -p /var/run/php /var/run/nginx

COPY .github/docker/default.conf /etc/nginx/sites-available/default
COPY .github/docker/www.conf /usr/local/etc/php-fpm.conf
COPY .github/docker/supervisord.conf /etc/supervisord.conf
COPY .github/docker/entrypoint.sh .github/docker/entrypoint.sh

EXPOSE 80 443 5173
ENTRYPOINT [ "/bin/bash", ".github/docker/entrypoint.sh" ]
CMD [ "supervisord", "-n", "-c", "/etc/supervisord.conf" ]
