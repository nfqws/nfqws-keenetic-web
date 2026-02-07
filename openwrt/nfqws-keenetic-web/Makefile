include $(TOPDIR)/rules.mk

PKG_NAME:=nfqws-keenetic-web
PKG_VERSION:=$(shell cat ../../VERSION)
PKG_RELEASE:=1
PKG_LICENSE:=MIT

include $(INCLUDE_DIR)/package.mk

define Package/nfqws-keenetic-web
  TITLE:=nfqws-keenetic-web
  SECTION:=net
  CATEGORY:=Networking
  DEPENDS:=+php8-cgi +php8-mod-session +php8-mod-curl +lighttpd +lighttpd-mod-cgi +lighttpd-mod-setenv +lighttpd-mod-rewrite +lighttpd-mod-redirect
  PKGARCH:=all
  URL:=https://github.com/nfqws/nfqws-keenetic-web
  VERSION:=$(PKG_VERSION)
endef

define Package/nfqws-keenetic-web/description
  NFQWS2 service web interface
endef

define Build/Prepare
		$(Build/Prepare/Default)
		cp -r ../../* $(PKG_BUILD_DIR)
		$(Build/Patch)
endef

define Build/Compile
		cd $(PKG_BUILD_DIR) && make web-openwrt
endef

define Package/nfqws-keenetic-web/install
		$(INSTALL_DIR) $(1)/{etc,www}
		$(CP) $(PKG_BUILD_DIR)/out/web-openwrt/data/{etc,www} $(1)/
endef

define Package/nfqws-keenetic-web/postinst
$(file <$(PKG_BUILD_DIR)/out/web-openwrt/control/postinst)
endef


$(eval $(call BuildPackage,nfqws-keenetic-web))

