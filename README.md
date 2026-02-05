# nfqws-keenetic-web

[![GitHub Release](https://img.shields.io/github/release/nfqws/nfqws-keenetic-web?style=flat&color=green)](https://github.com/nfqws/nfqws-keenetic-web/releases)
[![GitHub Stars](https://img.shields.io/github/stars/nfqws/nfqws-keenetic-web?style=flat)](https://github.com/nfqws/nfqws-keenetic-web/stargazers)
[![License](https://img.shields.io/github/license/nfqws/nfqws-keenetic-web.svg?style=flat&color=orange)](LICENSE)
[![CloudTips](https://img.shields.io/badge/donate-CloudTips-598bd7.svg?style=flat)](https://pay.cloudtips.ru/p/054d0666)
[![YooMoney](https://img.shields.io/badge/donate-YooMoney-8037fd.svg?style=flat)](https://yoomoney.ru/to/410019180291197)
[![Join Telegram group](https://img.shields.io/badge/Telegram_group-Join-blue.svg?style=social&logo=telegram)](https://t.me/nfqws)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/nfqws/nfqws-keenetic-web)

Пакеты для установки веб-интерфейса для [`nfqws`](https://github.com/Anonym-tsk/nfqws-keenetic) и [`nfqws2`](https://github.com/nfqws/nfqws2-keenetic) на маршрутизаторы.

<img src='https://raw.githubusercontent.com/nfqws/nfqws-keenetic-web/master/screenshot.jpg' />

### Установка на Keenetic/Netcraze и другие системы с Entware

1. Установите необходимые зависимости
   ```bash
   opkg update
   opkg install ca-certificates wget-ssl
   opkg remove wget-nossl
   ```

2. Установите opkg-репозиторий в систему
   ```bash
   mkdir -p /opt/etc/opkg
   echo "src/gz nfqws-keenetic-web https://nfqws.github.io/nfqws-keenetic-web/all" > /opt/etc/opkg/nfqws-keenetic-web.conf
   ```

3. Установите пакет
   ```bash
   opkg update
   opkg install nfqws-keenetic-web
   ```

##### Обновление

```bash
opkg update
opkg upgrade nfqws-keenetic-web
```

##### Удаление

```bash
opkg remove --autoremove nfqws-keenetic-web
```

##### Информация об установленной версии

```bash
opkg info nfqws-keenetic-web
```

---

### Установка на OpenWRT

#### До версии 24.10 включительно, пакетный менеджер `opkg`

1. Установите необходимые зависимости
   ```bash
   opkg update
   opkg install ca-certificates wget-ssl
   opkg remove wget-nossl
   ```

2. Установите публичный ключ репозитория
   ```bash
   wget -O "/tmp/nfqws-keenetic-web.pub" "https://nfqws.github.io/nfqws-keenetic-web/openwrt/nfqws-keenetic-web.pub"
   opkg-key add /tmp/nfqws-keenetic-web.pub
   ```

3. Установите репозиторий в систему
   ```bash
   echo "src/gz nfqws-keenetic-web https://nfqws.github.io/nfqws-keenetic-web/openwrt" > /etc/opkg/nfqws-keenetic-web.conf
   ```

4. Установите пакет
   ```bash
   opkg update
   opkg install nfqws-keenetic-web
   ```

#### Версии 25.xx и Snapshot, пакетный менеджер `apk`

1. Установите необходимые зависимости
   ```bash
   apk --update-cache add ca-certificates wget-ssl
   apk del wget-nossl
   ```

2. Установите публичный ключ репозитория
   ```bash
   wget -O "/etc/apk/keys/nfqws-keenetic-web.pem" "https://nfqws.github.io/nfqws-keenetic-web/openwrt/nfqws-keenetic-web.pem"
   ```

3. Установите репозиторий в систему
   ```bash
   echo "https://nfqws.github.io/nfqws-keenetic-web/openwrt/packages.adb" > /etc/apk/repositories.d/nfqws-keenetic-web.list
   ```

4. Установите пакет
   ```bash
   apk --update-cache add nfqws-keenetic-web
   ```

---

> [!NOTE]
> Адрес веб-интерфейса `http://<router_ip>:90` (например http://192.168.1.1:90)<br/>
> Для авторизации введите имя пользователя и пароль пользователя entware (по умолчанию root и keenetic если не меняли при установке)

> [!TIP]
> По-умолчанию php использует только 8Мб памяти. Из-за этого ограничения, могут не загружаться большие списки файлов.
> Вы можете изменить конфигурацию php самостоятельно:<br/>
> Откройте файл `/opt/etc/php.ini` и измените следующие значения
> ```ini
> memory_limit = 32M
> post_max_size = 32M
> upload_max_filesize = 16M
> ```

---

Нравится проект? Поддержи автора [здесь](https://yoomoney.ru/to/410019180291197) или [тут](https://pay.cloudtips.ru/p/054d0666). Купи ему немного :beers: или :coffee:!
