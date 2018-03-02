define('newbuy',['common'],function(require,exports,module){
	var common = require('common');
	var pub = {};

	// 记录分页状态

	pub.pageNo = common.pageNo;

	pub.pageIndex = 1; // 索引
	pub.isLast = null;

	pub.loadMore = $('.loadMore');

	pub.searchLoadMore = $('.search-page').find('.loadMore');

	pub.dialog = common.dialog.init();

	pub.subMenuIndex = common.subMenuIndex.getItem(); // 索引值, 1今日, 0全部

	pub.title = ['采购单','今日采购单'][pub.subMenuIndex];

	pub.json = {}; // json

	pub.goods = {
		pageIndex : 1,
		isLast : false,
		init : function(){
			var self = this;
			common.ajaxPost({
				method : 'goods_list',
				websiteNode : common.websiteNode,
				pageNo : self.pageIndex,
				pageSize : pub.pageNo,
				search : $('#data-checkout').val()
			},function( d ){
				if( d.statusCode == '100000' ){
					self.isLast = d.data.isLast;
					$('#goods-list-data-box').append( $('#goods-list-data').tmpl( d.data.objects ) );
					pub.searchLoadMore.text( common.dataText( self.isLast ) );
				}else{
					pub.dialog.show( d.statusStr );
				}
			},function(){},function(){
				pub.searchLoadMore.text(common.loadText);
			});
		}
	};

	pub.buyer = {
		pageIndex : 1,
		isLast : false,
		init : function(){
			var self = this;
			common.ajaxPost({
				method : 'buyer_list',
				websiteNode : common.websiteNode,
				pageNo : self.pageIndex,
				pageSize : pub.pageNo,
				search : $('#data-checkout').val()
			},function( d ){
				if( d.statusCode == '100000' ){
					self.isLast = d.data.isLast;
					$( '#buyer-list-data-box').append( $('#buyer-list-data').tmpl( d.data.objects ) );
					pub.searchLoadMore.text( common.dataText( self.isLast ) );
				}else{
					pub.dialog.show( d.statusStr );
				}
			},function(){},function(){
				pub.searchLoadMore.text(common.loadText);
			});
		}
	};
	pub.supplier = {
		pageIndex : 1,
		isLast : false,
		init : function(){
			var self = this;
			common.ajaxPost({
				method : 'supplier_list',
				websiteNode : common.websiteNode,
				websiteName : pub.json.websiteName,
				pageNo : self.pageIndex,
				pageSize : pub.pageNo,
				search : $('#data-checkout').val()
			},function( d ){
				if( d.statusCode == '100000' ){
					self.isLast = d.data.isLast;
					$('#supplier-list-data-box').append( $('#supplier-list-data').tmpl( d.data.objects ) );
					pub.searchLoadMore.text( common.dataText( self.isLast ) );
				}else{
					pub.dialog.show( d.statusStr );
				}
			},function(){},function(){
				pub.searchLoadMore.text(common.loadText);
			});
		}
	};
	pub.city = {
		init : function(){
			common.ajaxPost({
				method : 'business_city_list',
				search : $('#data-checkout').val() 
			},function( d ){
				if( d.statusCode == '100000' ){
					$('#city-list-data-box').html( $('#city-list-data').tmpl( d.data ) );
					pub.searchLoadMore.text( common.dataText( self.isLast ) );
				}else{
					pub.dialog.show( d.statusStr );
				}
			},function(){},function(){
				pub.searchLoadMore.text(common.loadText);
			});
		}
	}

	pub.dataBox = $('#buyer_bill_list-data-box');
	pub.apiHandle = {
		buyer_bill_list : {
			init : function( bool ){
				common.ajaxPost({
					method : 'buyer_bill_list',
					status : 0, // 未确认
					isToday : pub.subMenuIndex, 
					search : $('.search-input').val(), 
					pageNo : pub.pageIndex,
					pageSize : pub.pageNo,
				},function( d ){
					switch( +d.statusCode ){
						case 100000 : (function(){
							pub.isLast = d.data.isLast;
							bool && pub.dataBox.removeData('buyer_bill_list').empty();
							pub.dataBox.append( $('#buyer_bill_list-data').tmpl( d.data.objects ) );
							pub.dataBox.data('buyer_bill_list', ( pub.dataBox.data('buyer_bill_list') || [] ).concat( d.data.objects )  );
							pub.loadMore.text( common.dataText( pub.isLast ) );
						})(); break;
						default : (function(){
							pub.dialog.show( d.statusStr );
							pub.loadMore.hide();
						})(); 
					}
				},function( d ){
					pub.dialog.show( d.statusStr );
					pub.loadMore.hide();
				},function(){
					pub.loadMore.text(common.loadText);
				});
			}
		},
		buyer_bill_add : {
			init : function(){
				common.ajaxPost($.extend({},{
					method : 'buyer_bill_add'
				},pub.json),function( d ){
					d.statusCode == '100000' ? (function(){
						common.dialog.init().show('新增成功',function(){
							window.history.back();
							pub.pageIndex = 1;
							pub.apiHandle.buyer_bill_list.init( true );
						});
					})() : pub.dialog.show( d.statusStr );
				},function( d ){
					pub.dialog.show( d.statusStr );
				});
			}
		}
	};

	pub.apiHandle.eventHandle = {
		init : function(){
			$('.search-input').focus(function(){
				$(this).parents('.search-box').addClass('actived');
			});

			// 搜索按钮
			$('.search-btn').click(function(){
				pub.pageIndex = 1;
				pub.apiHandle.buyer_bill_list.init( true );	
			});
			// 点击加载更多
			pub.loadMore.click(function(){
				var node = $(this).parents('[module-id]');
				var modueId = node.attr('module-id');
				if( modueId == 'searchlist' ){
					if( !pub[pub.dataPage].isLast ){
						pub[pub.dataPage].pageIndex++;
						pub[pub.dataPage].init();
					}else{
						node.find('.loadMore').html('没有更多数据');
					}
				}else{
					if( !pub.isLast ){
						pub.pageIndex++;
						pub.apiHandle.buyer_bill_list.init();
					}else{
						pub.loadMore.text('没有更多数据');
					}
				}

			});
			// 展示详情
			pub.dataBox.on('click','.list',function(){
				var i = $(this).index();
				$('#buylistdetail-data-box').html( $('#buylistdetail-data').tmpl( pub.dataBox.data('buyer_bill_list')[i] ) );
				$('.buylist-page').hide().next().show();
				window.history.pushState({page:'buylistdetail-page',title:'采购单详情'},'','#buylistdetail-page');
			});

			// 回退
			$('.arrow.left').click(function(){
				window.history.back();
			});
			$('#add-newbuy').click(function(){
				pub.json = {};
				$('.search-input').val('');
				$('.newbuylist-page').show().siblings().hide();
				$('title').html('新建采购单');
				$('.newbuylist-page ul').find('input,textarea').not('#website-city').val('');
				window.history.pushState({page:'newbuylist-page',title:'新建采购单'},'','#newbuylist-page');
			});
			window.onpopstate = function( e ){
				// console.log(e.state);
				if( !e.state ){
					$('.buylist-page').show().siblings().hide();
				}else{
					$('.newbuylist-page').show().siblings().hide();
				}
			}

			// 点击对应的 查找
			$('[data-search]').click(function(){
				var dataSearch =  $(this).attr('data-search');
				pub.searchPage = $('.search-page .' + dataSearch );
				// var loadMore = $('.search-page .loadMore');
				$('#data-checkout').attr('placeholder',{
					// 'city-list' : '请输入搜索的站点城市名称',
					'goods-list' : '请输入搜索的商品名称',
					'buyer-list' : '请输入搜索的是采购员的名称',
					'supplier-list' : '请输入搜索的供应商名称'
				}[dataSearch]).val(''); // 清空数据
				pub.dataPage = pub.searchPage.empty().attr('data-page'); 

				pub.searchLoadMore.show().html( common.dataText( pub[pub.dataPage].isLast ) );
				pub[pub.dataPage].init();
				$('.newbuylist-page').hide().siblings('.search-page').show();
				pub.searchPage.show().siblings('ul').hide(); 
				window.history.pushState({page:'search-page',title:'搜索'},'','#search-page');
			});
			// 点击搜索
			$('#checkout-btn').click(function(){
				if( pub.dataPage == 'city' ){ // 站点
					pub.city.init();
				}else{
					pub[pub.dataPage].pageIndex = 1;
					pub.searchPage.empty();
					pub[pub.dataPage].init();
				}
			});

			// 选值操作
			$('.search-page .search-content').on('click','[data-id]',function(){
				var $this = $(this);
				pub.dataId = $this.attr('data-id');
				pub.name = $this.text();
				var parentNode = $this.parents('[data-page]');
				var className = parentNode.attr('class');

				$('.search-page').hide().siblings('.newbuylist-page').show();
				$('[data-search=' + className + ']').find('input').val( pub.name );
				console.log(className,pub.dataId);
				switch( className ){
					case 'goods-list' : pub.json.goodsId = pub.dataId; break;
					case 'buyer-list' : pub.json.buyerId = pub.dataId;break;
					case 'supplier-list' : pub.json.preSupplierId = pub.dataId;break;
				};
				window.history.back();
			});

			// 保存提交
			$('#submit-btn').click(function(){
				if( !pub.json.goodsId ) {
					pub.dialog.show('请选择商品'); return; 
				}
				var preBuyNum = $('#json-preBuyNum').val();
				if( !preBuyNum ){
					pub.dialog.show('请填写预采购量'); return;
				}
				if( !common.num.test( preBuyNum ) ){
					pub.dialog.show('预采购量必须为整数'); return;
				}
				if( !pub.json.buyerId ){
					pub.dialog.show('请选择采购员'); return;
				}
				pub.json.websiteName = common.websiteName;
				pub.json.websiteNode = common.websiteNode;
				pub.json.yestodayQuote = $('#json-yestodayQuote').val();
				pub.json.preBuyNum = preBuyNum;
				pub.json.note = $('#json-note').val();
				pub.apiHandle.buyer_bill_add.init();
			});

		}
	};

	pub.init = function(){
		pub.apiHandle.buyer_bill_list.init();
		pub.apiHandle.eventHandle.init();
		$('title,#buylist-page .header-title').html( pub.title );
	};
	module.exports = pub;
});