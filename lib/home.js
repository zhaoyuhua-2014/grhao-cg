/*
	login + manager
*/
define('home',['common'],function( require, exports, module ){
	var common = require('common');
	var pub = {};

	pub.logined = common.isLogin();

	pub.dialog = common.dialog.init();

	pub.dfd = $.Deferred();

	pub.titles = ['采购管理','商品更新记录','库存管理','我'];

	pub.login = {}; // 登录模块

	pub.manager = {}; // 管理模块

	pub.loginBox = $('.login-page');

	pub.userInfoBox = $('#userInfo-data-box');

	function clearCache() {
        window.webkit.messageHandlers.clearCache.postMessage(null);
    }


	pub.reRender = function( data ){
		pub.userInfoBox.html( $('#userInfo-data').tmpl( data ) );
	};

	pub.login.eventHandle = {
		init : function(){
			pub.box = $('#login-box');
			pub.box.on('click','#btn',function(){
				var username = $('#username').val();
				var pass = $('#pass').val();
				if( !username ){
					pub.dialog.show('请输入手机号'); return;
				}
				if( !common.telNumReg.test( username ) ){
					pub.dialog.show('手机号输入有误，请重新输入'); return;
				}
				if( !pass){
					pub.dialog.show('请输入密码'); return;
				}
				if( !common.pass.test( pass )){
					pub.dialog.show('密码格式错误，请重新输入'); return;
				}
				common.ajaxPost({
					method : 'login',
					mobile : username,
					passwd : common.encrypt.md5( pass )
				},function( d ){
					switch( +d.statusCode ){
						case 100000 : (function(){
							common.secretKey.setItem( d.data.secretKey );
							common.tokenId.setItem( d.data.tokenId );
							common.stocker.setItem( d.data.stocker );
							common.menuIndex.setItem( 0 );
							pub.footerBox.eq( 0 ).trigger('click');
							$('.login-page').hide().next().show();
							pub.reRender( d.data.stocker );
						})(); break;
						default : pub.dialog.show( d.statusStr );
					}
				});
			});

			// 清缓存
			pub.userInfoBox.on('click','#clearCached',function(){
				try{
					common.isApple() ? clearCache() : android.AndroidClearCache();
				}catch( e ){
					// alert( e.name + ':' + e.message );
				}
			});
		}
	};
	pub.login.init = function(){
		pub.login.eventHandle.init();
	};

	pub.manager.eventHandle = {
		init : function(){
			var menuIndex = common.menuIndex.getItem();
			var buymanagerBox = $('.buymanager-box');
			pub.footerBox = $('.footer-box li');
			pub.footerBox.on('click',function(){
				var $this = $(this);
				var i = $this.index();
				$this.addClass('actived').siblings().removeClass('actived');
				buymanagerBox.eq( i ).show().siblings().hide();
				common.menuIndex.setItem( i );
				$('title,.manager-page .header-box .content').html( pub.titles[i] );
			});
			pub.dfd.done(function(){
				pub.footerBox.eq( menuIndex ).trigger('click');
			});
			$('[data-url]').bind('click',function(){
				var $this = $(this);
				common.jumpLinkPlain( $this.attr( 'data-url' ) );
				common.subMenuIndex.setItem( +$this.attr( 'data-index' ) );
			});
		}
	};
	pub.manager.init = function(){
		pub.manager.eventHandle.init();
		$('#login-out').click(function(){
			common.ajaxPost({
				method : 'logout',
				tokenId : common.tokenId.getItem()
			},function( d ){
				if( d.statusCode == '100000' ){
					common.local.clear();
					pub.loginBox.show().next().hide();
					pub.reRender( common.stocker.getItem() );
					$('#login-box').find('#pass').val('');
				}else{
					pub.dialog.show( d.statusStr );
				}
			});
		});
	};
	pub.init = function(){
		pub.stocker = common.stocker.getItem();
		pub.login.init();
		pub.manager.init();
		pub.logined ? (function(){
			pub.dfd.resolve();
			pub.reRender( pub.stocker );
			pub.loginBox.hide().next().show();
		})() : pub.loginBox.show().next().hide();
	}
	module.exports = pub;
});