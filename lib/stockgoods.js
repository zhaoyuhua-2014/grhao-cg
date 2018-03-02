define('stockgoods',['common'],function(require,exports,module){

	var pub = {};
	var common = require( 'common' );

	pub.stockgoodsPageIndex = 1;

	pub.pageNo = common.pageNo;

	pub.stockListBox = $('#stock_list-data-box');

	pub.modalBox = $('#modal-box');


	pub.stocker = common.stocker.getItem();


	pub.websiteNode = pub.stocker.websiteNode;

	pub.stockgoodsLoadMore = $('.stock-stockgoods-page .loadMore'); // 商品列表

	pub.searchLoadMore = $('.search-page .loadMore');

	pub.dataBox = $('#stock_list-data-box');

	pub.json = {}; // json

	pub.oparations = {
		'stock-stockgoods-city-page' : '城市调拨',
		'stock-stockgoods-inner-page' : '内部调货',
		'stock-stockgoods-modify-page' : '修改'
	};

	pub.stock_update = ['stockNum','stockWeight','buyPrice','price','note']; // 库存更新

	pub.stock_change = ['stockWeight','outNum','note']; // 城市调拨

	pub.oparationJson = {};

	pub.dialog = common.dialog.init();
	pub.goods = {
		pageIndex : 1,
		isLast : false,
		init : function(){
			var self = this;
			common.ajaxPost({
				method : 'goods_list',
				websiteNode : pub.json.websiteNode || pub.websiteNode,
				pageNo : self.pageIndex,
				pageSize : pub.pageNo,
				rel : 'stock', // 查出所有库存商品 商品带回--库存系统使用
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
				pub.searchLoadMore.show().text( common.loadText );
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
				}else{
					pub.dialog.show( d.statusStr );
				}
				pub.searchLoadMore.hide();
			},function(){
				pub.searchLoadMore.hide();
			},function(){
				pub.searchLoadMore.text( common.loadText );
			});
		}
	}

	pub.apiHandle = {
		stock_list : {
			init : function( bool ){
				common.ajaxPost({
					method : 'stock_list',
					websiteNode : pub.websiteNode,
					pageNo : pub.stockgoodsPageIndex,
					pageSize : common.pageNo,
					search : $('.search-input').val()
				},function( d ){
					if( d.statusCode == '100000' ){
						pub.stockgoodsIsLast = d.data.isLast;
						bool && pub.dataBox.removeData('stock_list').empty();
						pub.dataBox.append( $('#stock_list-data').tmpl( d.data.objects ) );
						pub.dataBox.data('stock_list', ( pub.dataBox.data('stock_list') || [] ).concat( d.data.objects )  );
						pub.stockgoodsLoadMore.text( common.dataText( pub.stockgoodsIsLast ) );
					}
				},function( d ){
					pub.dialog.show( d.statusStr );
					pub.stockgoodsLoadMore.hide();
				},function(){
					pub.stockgoodsLoadMore.text( common.loadText );	
				});
			}
		},
		stock_add : {
			init : function(){
				common.ajaxPost(pub.json,function( d ){
					if( d.statusCode == '100000' ){
						common.dialog.init().show('库存商品新增成功',function(){
							window.history.back();
							pub.stockgoodsPageIndex = 1;
							pub.apiHandle.stock_list.init( true );
						});
					}else{
						pub.dialog.show( d.statusStr );
					}
				});
			}
		},
		stock_update : {
			init : function(){
				common.ajaxPost(pub.oparationJson,function( d ){
					if( d.statusCode == '100000' ){
						window.history.back();
						pub.stockgoodsPageIndex = 1;
						pub.apiHandle.stock_list.init( true );
					}else{
						pub.dialog.show( d.statusStr );
					}
				});
			}
		},
		stock_change : {
			init : function(){
				common.ajaxPost(pub.oparationJson, function( d ){
					if( d.statusCode == '100000' ){
						window.history.back();
						pub.stockgoodsPageIndex = 1;
						pub.apiHandle.stock_list.init( true );
					}else{
						pub.dialog.show( d.statusStr );
					}
				});
			}
		},
		stock_transfer : {
			init : function(){
				common.ajaxPost(pub.oparationJson, function( d ){
					if( d.statusCode == '100000' ){
						window.history.back();
						pub.stockgoodsPageIndex = 1;
						pub.apiHandle.stock_list.init( true );
					}else{
						pub.dialog.show( d.statusStr );
					}
				});
			}
		},
		stock_to_supplier : {
			init : function(){
				common.ajaxPost(pub.oparationJson,function( d ){
					if( d.statusCode == '100000' ){
						window.history.back();
						pub.stockgoodsPageIndex = 1;
						pub.apiHandle.stock_list.init( true );
					}else{
						pub.dialog.show( d.statusStr );
					}
				})
			}
		}
	}
	pub.eventHandle = {
		init : function(){
			// 功能弹窗
			pub.stockListBox.on('click','.list .btn',function( e ){
				var $this = $(this);
				var parentNode = $this.parents('.list');
				var offsetTop = parentNode.offset().top;
				pub.modalBox.show().find('.content').css('top',offsetTop - 21);
				pub.index = parentNode.index();
				e.stopPropagation();
			});
			pub.modalBox.click(function(){
				$(this).hide();
			});
			pub.modalBox.on('click','p',function( e ){
				var $this = $(this);
				var target = e.target;
				var className = target.className;
				pub.modalBox.hide();
				pub.dataLink = $(target).attr('data-link');
				var box = $('.' + pub.dataLink );
				var data = pub.dataBox.data('stock_list')[pub.index];
				box.show().siblings().hide();
				window.history.pushState( {page:pub.dataLink,title: pub.oparations[ pub.dataLink ] }, '', '#' + className );
				$('title').html( pub.oparations[ pub.dataLink ] );
				$('#' + pub.dataLink + '-box').html( $('#' + pub.dataLink + '-data').tmpl( data ) );
				pub.stock_update_id = data.id;
				e.stopPropagation();
			});

			// 展示详情
			pub.dataBox.on('click','.list',function(){
				var i = $(this).index();
				$('#stocklistdetail-data-box').html( $('#stocklistdetail-data').tmpl( pub.dataBox.data('stock_list')[i] ) );
				$('.stock-stockgoods-page').hide().next().show();
				window.history.pushState({page:'stocklistdetail-page',title:'采购单详情'},'','#stocklistdetail-page');
			});
			// 点击加载更多
			pub.stockgoodsLoadMore.click(function(){
				var node = $(this).parents('[module-id]');
				var modueId = node.attr('module-id');
				if( !pub.stockgoodsIsLast ){
					pub.stockgoodsPageIndex++;
					pub.apiHandle.stock_list.init();
				}else{
					pub.stockgoodsLoadMore.text('没有更多数据');
				}
			});
			pub.searchLoadMore.click(function(){
				var node = $(this).parents('[module-id]');
				if( !pub[pub.dataPage].isLast ){
					pub[pub.dataPage].pageIndex++;
					pub[pub.dataPage].init();
				}else{
					node.find('.loadMore').html('没有更多数据');
				}
			});
			// 点击新增
			$('#add-newbuy').click(function(){
				pub.json = {};
				$('.search-input').val('');
				$('.newbuylist-page').show().siblings().hide();
				$('title').html('新建库存商品');
				$('.newbuylist-page li').find('input,textarea').not('#website-city').val('');
				window.history.pushState({page:'newbuylist-page',title:'新建库存商品'},'','#newbuylist-page');
			});
			// 回退
			$('.arrow.left').click(function(){
				window.history.back();
			});
			window.onpopstate = function( e ){
				if( !e.state ){
					$('.stock-stockgoods-page').show().siblings().hide();
				}else{
					$('.' + e.state.page ).show().siblings().hide();
				}
			}
			// 城市调拨 + 内部调货 + 修改操作
			$('.body').on('click','.stock-oparate-btn',function( e ){
				e.stopPropagation();
				var $this = $(this);
				var parentsNode = $this.parents('[data-btn]');
				var parentsAttr = parentsNode.attr('data-btn');
				// console.log( parentsAttr,'parentsAttr');
				pub.oparationJson = {};
				var oparation = pub.oparationJson;
				if( parentsAttr == 'stock-stockgoods-modify-page' ) {
					parentsNode.find('.serialize').each(function(i,v){
						oparation[ pub.stock_update[i] ] = v.value;
					});

					if( oparation.stockNum && !common.num.test( oparation.stockNum ) ){
						pub.dialog.show('库存商品件数必须为整数');
						return;
					}
					oparation.method = 'stock_update';
					oparation.stockId = pub.stock_update_id; // 库存商品ID
					pub.apiHandle.stock_update.init();
				}else if( parentsAttr == 'stock-stockgoods-city-page' ){
					parentsNode.find('.serialize').each(function(i,v){
						oparation[ pub.stock_change[i] ] = v.value;
					});
					if( oparation.stockNum && !common.num.test( oparation.stockNum ) ){
						pub.dialog.show('库存商品件数必须为整数');return;
					}
					oparation.stockerId = pub.stocker.id // 用户ID
					oparation.method = 'stock_change';
					oparation.stockId = pub.stock_update_id; // 库存商品ID
					oparation.outCity = pub.dataId; // 调拨目标城市编码
					if( !oparation.outCity ){
						pub.dialog.show('请选择目标城市'); return;
					}
					pub.apiHandle.stock_change.init();
				}else if( parentsAttr == 'stock-stockgoods-inner-page' ){
					parentsNode.find('.serialize').each(function(i,v){
						oparation[v.name] = v.value;
					});
					if( oparation.outNum && !common.num.test( oparation.outNum ) ){
						pub.dialog.show('库存商品件数必须为整数');return;
					}
					oparation.stockerId = pub.stocker.id // 用户ID
					oparation.stockId = pub.stock_update_id; // 库存商品ID
					oparation.transGoodsId = pub.dataId; // 调货商品ID
					oparation.transGoodsName = pub.transGoodsName; // 调货商品名
					oparation.transGoodsCode = pub.transGoodsCode; // 调货商品编码
					if( !oparation.transGoodsId ){
						pub.dialog.show('请选择内部调货商品'); return;
					}
					if( !oparation.outNum ){
						pub.dialog.show('请填写内部调货件数'); return;
					}
					pub.apiHandle.stock_transfer.init();
				}else{
					oparation.stockerId = pub.stocker.id // 用户ID
					parentsNode.find('.serialize').each(function(i,v){
						oparation[v.name] = v.value;
					});	
					if( !oparation.outNum ){
						pub.dialog.show('请填写退回件数'); return;
					}
					pub.apiHandle.stock_to_supplier.init();
				}
			});
			// 城市调拨处理
			$('.body').on('click','[data-url]',function( e ){
				pub.json = {};
				pub.dataPage = $(this).attr('data-url');
				$('#data-checkout').attr('placeholder',{
					'city-list' : '请输入搜索的城市站点名称',
					'goods-list' : '请输入搜索的商品名称',
					'city' : '请输入搜索的城市名称',
					'goods' : '请输入搜索的商品名称'
				}[ pub.dataPage ]).val(''); // 清空搜索值
				var searchPage = $('.search-page');
				searchPage.show().siblings().hide();
				searchPage.find('[data-page]').empty();
				searchPage.find('[data-page="' + pub.dataPage + '"]').show().siblings('ul').hide();
				window.history.pushState({page:'newbuylist-page',title:'调度'},'','#city');
				pub[ pub.dataPage ].init(); 
			});

			// 搜索按钮
			$('.search-input').focus(function(){
				$(this).parents('.search-box').addClass('actived');
			});
			$('.search-btn').click(function(){
				pub.stockgoodsPageIndex = 1;
				pub.apiHandle.stock_list.init( true );	
			});

			// 点击搜索
			$('#checkout-btn').click(function(){
				if( pub.dataPage == 'city' ){ // 站点
					pub.city.init();
				}else{
					$('[data-page="' + pub.dataPage + '"]').empty(); // 清空上一次数据
					pub[pub.dataPage].pageIndex = 1;
					pub[pub.dataPage].init();
				}
			});

			// 点击对应的 查找
			$('[data-search]').click(function(){
				var dataSearch =  $(this).attr('data-search');
				var searchPage = $('.search-page .' + dataSearch );
				$('#data-checkout').attr('placeholder',{
					// 'city-list' : '请输入搜索的城市站点名称',
					'goods-list' : '请输入搜索的商品名称',
					'city' : '请输入搜索的城市站点名称',
					'goods' : '请输入搜索的商品名称'
				}[ dataSearch ]).val(''); // 清空数据
				pub.dataPage = searchPage.empty().attr('data-page');
				pub.searchLoadMore.show().html( common.dataText( pub[pub.dataPage].isLast ) );
				pub[pub.dataPage].init();
				$('.newbuylist-page').hide().siblings('.search-page').show(); // 页面切换
				searchPage.show().siblings('ul').hide(); // 查询列表切换
				window.history.pushState({page:'search-page',title:'搜索'},'','#search-page');
			});
			// 选值操作
			$('.search-page .search-content').on('click','[data-id]',function( e ){
				e.stopPropagation();
				var $this = $(this);
				pub.dataId = $this.attr('data-id');
				pub.transGoodsName = $this.attr('data-goodsName');	
				pub.transGoodsCode = $this.attr('data-goodsCode');	
				pub.name = $this.text();
				var parentNode = $this.parents('[data-page]');
				var className = parentNode.attr('class');
				$('.search-page').hide().siblings('.newbuylist-page').show();
				$('[data-search=' + className + ']').find('input').val( pub.name );
				$('#dist-city').val( pub.name );
				$('#dist-goods').val( pub.name );
				switch( className ){
					case 'goods-list' : pub.json.goodsId = pub.dataId; break;
					case 'buyer-list' : pub.json.buyerId = pub.dataId; break;
					case 'supplier-list' : pub.json.preSupplierId = pub.dataId; break;
				};
				window.history.back();
			});
			// 保存提交
			$('#submit-btn').click(function(){
				var json = pub.json;
				if( !json.goodsId ) {
					pub.dialog.show('请选择商品'); return; 
				}
				json.method = 'stock_add';
				json.stockNum = $('#json-outNum').val();
				if( json.stockNum && !common.num.test( json.stockNum )){
					pub.dialog.show( '库存商品件数必须为整数' ); return;
				}
				json.price = $('#json-price').val();
				if( json.price == '' ){
					pub.dialog.show('请填写库存商品售价'); return; 
				}
				json.websiteNode = common.websiteNode;
				json.websiteName = common.websiteName;
				json.stockWeight = $('#json-stockWeight').val();
				json.buyPrice = $('#json-buyerPrice').val();
				json.note = $('#json-note').val();
				pub.apiHandle.stock_add.init();
			});
		}
	};



	pub.init = function(){
		pub.apiHandle.stock_list.init();
		pub.eventHandle.init();
	};

















	
	module.exports = pub;
});