_repo-clean:
	rm -rf out/_pages/$(BUILD_DIR)
	mkdir -p out/_pages/$(BUILD_DIR)

_repo-copy:
	cp "out/$(WEB)" "out/_pages/$(BUILD_DIR)/"

	@if [[ -n "$(WEB_APK)" ]]; then \
		cp "out/$(WEB_APK)" "out/_pages/$(BUILD_DIR)/"; \
	fi

_repo-html:
	echo '<html><head><title>nfqws-keenetic-web repository</title></head><body>' > out/_pages/$(BUILD_DIR)/index.html
	echo '<h1>Index of /$(BUILD_DIR)/</h1><hr>' >> out/_pages/$(BUILD_DIR)/index.html
	echo '<pre>' >> out/_pages/$(BUILD_DIR)/index.html
	echo '<a href="../">../</a>' >> out/_pages/$(BUILD_DIR)/index.html
	echo '<a href="Packages">Packages</a>' >> out/_pages/$(BUILD_DIR)/index.html
	echo '<a href="Packages.gz">Packages.gz</a>' >> out/_pages/$(BUILD_DIR)/index.html
	@if [[ "$(BUILD_DIR)" == "openwrt" ]]; then \
  		echo '<a href="Packages.sig">Packages.sig</a>' >> out/_pages/$(BUILD_DIR)/index.html; \
  		echo '<a href="packages.adb">packages.adb</a>' >> out/_pages/$(BUILD_DIR)/index.html; \
  		echo '<a href="nfqws-keenetic-web.pub">nfqws-keenetic-web.pub</a>' >> out/_pages/$(BUILD_DIR)/index.html; \
  		echo '<a href="nfqws-keenetic-web.pem">nfqws-keenetic-web.pem</a>' >> out/_pages/$(BUILD_DIR)/index.html; \
		echo '<a href="$(WEB_APK)">$(WEB_APK)</a>' >> out/_pages/$(BUILD_DIR)/index.html; \
  	fi
	echo '<a href="$(WEB)">$(WEB)</a>' >> out/_pages/$(BUILD_DIR)/index.html
	echo '</pre>' >> out/_pages/$(BUILD_DIR)/index.html
	echo '<hr></body></html>' >> out/_pages/$(BUILD_DIR)/index.html

_repo-index:
	echo '<html><head><title>nfqws-keenetic-web repository</title></head><body>' > out/_pages/index.html
	echo '<h1>Index of /</h1><hr>' >> out/_pages/index.html
	echo '<pre>' >> out/_pages/index.html
	echo '<a href="all/">all/</a>' >> out/_pages/index.html
	echo '<a href="openwrt/">openwrt/</a>' >> out/_pages/index.html
	echo '</pre>' >> out/_pages/index.html
	echo '<hr></body></html>' >> out/_pages/index.html

_repository:
	make _repo-clean
	make _repo-copy

	echo "Package: nfqws-keenetic-web" >> out/_pages/$(BUILD_DIR)/Packages
	echo "Version: $(VERSION)" >> out/_pages/$(BUILD_DIR)/Packages
	echo "Depends: php8-cgi, php8-mod-session, lighttpd, lighttpd-mod-cgi, lighttpd-mod-setenv, lighttpd-mod-rewrite, lighttpd-mod-redirect" >> out/_pages/$(BUILD_DIR)/Packages
	echo "Section: net" >> out/_pages/$(BUILD_DIR)/Packages
	echo "Architecture: all" >> out/_pages/$(BUILD_DIR)/Packages
	echo "Filename: $(WEB)" >> out/_pages/$(BUILD_DIR)/Packages
	echo "Size: $(shell wc -c out/$(WEB) | awk '{print $$1}')" >> out/_pages/$(BUILD_DIR)/Packages
	echo "SHA256sum: $(shell sha256sum out/$(WEB) | awk '{print $$1}')" >> out/_pages/$(BUILD_DIR)/Packages
	echo "Description:  NFQWS2 service web interface" >> out/_pages/$(BUILD_DIR)/Packages
	echo "" >> out/_pages/$(BUILD_DIR)/Packages

	gzip -k out/_pages/$(BUILD_DIR)/Packages

	@make _repo-html

repo-multi:
	@make \
		BUILD_DIR=all \
		ARCH=all \
		WEB=nfqws-keenetic-web_$(VERSION)_all_entware.ipk \
		_repository

repo-openwrt:
	@make \
		BUILD_DIR=openwrt \
		WEB=nfqws-keenetic-web_$(VERSION)_all.ipk \
		WEB_APK=nfqws-keenetic-web-$(VERSION).apk \
		_repo-clean _repo-copy _repo-html

repository: repo-multi repo-openwrt _repo-index
