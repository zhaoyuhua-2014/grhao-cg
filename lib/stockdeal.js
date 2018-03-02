define('stockdeal',['common'],function(require,exports,module){
	var common = require('common');
	var pub = {};

	// 记录分页状态

	pub.pageNo = common.pageNo;

	pub.pageIndex = 1; // 索引

	pub.isLast = null;

	pub.loadMore = $('.weighed-page .loadMore');

	pub.searchLoadMore = $('.search-page .loadMore');

	pub.dialog = common.dialog.init();

	pub.dataBox = $('#stock_sell_list-data-box');

	pub.stocker = common.stocker.getItem(); // 仓管信息

	pub.websiteNode = pub.stocker.websiteNode; // 站点

	pub.stock_sell_addJSON = {};
	// 城市站点
	pub.city = {
		pageIndex : 1,
		isLast : false,
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
				pub.searchLoadMore.text( common.loadText );
			});
		}
	};
	// 商品
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
	pub.apiHandle = {
		stock_sell_list : {
			init : function( bool ){
				common.ajaxPost({
					method : 'stock_sell_list',
					websiteNode : pub.websiteNode,
					pageNo : pub.pageIndex,
					pageSize : common.pageNo,
					search : $('.search-input').val()
				},function( d ){
					if( d.statusCode == '100000' ){
						pub.isLast = d.data.isLast;
						bool && pub.dataBox.removeData('stock_sell_list').empty();
						pub.dataBox.append( $('#stock_sell_list-data').tmpl( d.data.objects ) );
						pub.dataBox.data('stock_sell_list', ( pub.dataBox.data('stock_sell_list') || [] ).concat( d.data.objects )  );
						pub.loadMore.text( common.dataText( pub.isLast ) );
					}else{
						pub.dialog.show( d.statusStr );	
					}
				},function( d ){
					pub.dialog.show( d.statusStr );
					pub.loadMore.hide();
				},function(){
					pub.loadMore.text( common.loadText );
				});
			}
		},
		stock_sell_is_check : {
			init : function(){
				common.ajaxPost({
					method : 'stock_sell_is_check',
					stockSellId : pub.stockSellId,
					stockerId : pub.stocker.id
				},function( d ){
					if( d.statusCode == '100000' ){
						window.history.back();
						pub.pageIndex = 1;
						pub.apiHandle.stock_sell_list.init( true );
					}else{
						pub.dialog.show( d.statusStr );
					}
				})
			}
		},
		stock_sell_not_check : {
			init : function(){
				common.ajaxPost({
					method : 'stock_sell_not_check',
					stockSellId : pub.stockSellId,
					stockerId : pub.stocker.id
				},function( d ){
					if( d.statusCode == '100000' ){
						window.history.back();
						pub.pageIndex = 1;
						pub.apiHandle.stock_sell_list.init( true );
					}else{
						pub.dialog.show( d.statusStr );
					}
				})
			}
		},
		stock_sell_add : {
			init : function(){
				common.ajaxPost(pub.stock_sell_addJSON,function( d ){
					if( d.statusCode == '100000' ){
						window.history.back();
						pub.pageIndex = 1;
						pub.apiHandle.stock_sell_list.init( true );
					}else{
						pub.dialog.show( d.statusStr );
					}
				});
			}
		},
		stock_sell_delete : {
			init : function(){
				common.ajaxPost({
					method : 'stock_sell_delete',
					stockSellId : pub.stockSellId ,
				},function( d ){
					if( d.statusCode == '100000' ){
						alert('删除成功');
						pub.pageIndex = 1;
						pub.apiHandle.stock_sell_list.init( true );	
					}else{
						pub.dialog.show( d.statusStr );
					}
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
				pub.apiHandle.stock_sell_list.init( true );	
			});

			// 点击加载更多
			pub.loadMore.click(function(){
				if( !pub.isLast ){
					pub.pageIndex++;
					pub.apiHandle.stock_sell_list.init();
				}else{
					pub.loadMore.text( '没有更多数据' );
				}
			});
			pub.searchLoadMore.click(function(){
				if( !pub[pub.dataPage].isLast ){
					pub[pub.dataPage].pageIndex++;
					pub[pub.dataPage].init();
				}else{
					node.find('.loadMore').html('没有更多数据');
				}
			});

			// 展示详情
			pub.checkBtns = $('.checkBtns');
			pub.dataBox.on('click','.list',function( e ){
				var i = $(this).index();
				var data = pub.dataBox.data('stock_sell_list')[i];
				pub.stockSellId = data.id; // 仓库处理记录ID
				$('#buylistdetail-data-box').html( $('#buylistdetail-data').tmpl( data ) );
				$('.buylistdetail-page').show().siblings().hide();
				var status = data.status;
				// ['审核未通过','未审核','审核通过'][status+1]
				if( status == -1 ){
					pub.checkBtns.find('.checkBtn').eq(0).addClass('status').siblings().removeClass('status');
				}else if( status == 0 ){
					pub.checkBtns.find('.checkBtn').addClass('status');
				}else{
					pub.checkBtns.find('.checkBtn').eq(1).addClass('status').siblings().removeClass('status');
				}
				window.history.pushState({page:'buylistdetail-page',title:'仓库处理记录详情'},'','#buylistdetail-page');
				e.stopPropagation();
			});

			pub.checkBtns.on('click','.checkBtn.status',function(){
				var dataApi = $(this).attr('data-api');
				var tip = {
					stock_sell_is_check : '确认审核通过？',
					stock_sell_not_check : '确认审核不通过？'
				}[ dataApi ];
				common.dialog.init({
					btns : [  { klass : 'dialog-cancel-btn', txt:'取消'}, { klass : 'dialog-confirm-btn', txt : '确认'} ]
				}).show(tip,function(){
					pub.dialog = common.dialog.init({ klass : 'dialog-confirm-btn', txt : '知道了'});
				},function(){
					pub.dialog = common.dialog.init({ klass : 'dialog-confirm-btn', txt : '知道了'});
					pub.apiHandle[dataApi].init();
				});
			});
			// 新建
			$('#add-newbuy').click(function(){
				pub.json = {};
				$('.search-input').val('');
				$('.newbuylist-page').show().siblings().hide();
				$('title').html('新建仓库处理记录');
				$('.newbuylist-page li').find('input,textarea').not('#website-city').val('');
				window.history.pushState({page:'newbuylist-page',title:'新建仓库处理记录'},'','#newbuylist-page');
			});
			// 回退
			$('.arrow.left').click(function(){
				window.history.back();
			});
			window.onpopstate = function( e ){
				console.log(e.state);
				if( !e.state ){
					$('.weighed-page').show().siblings().hide();
				}else{
					$('.newbuylist-page').show().siblings().hide();
				}
			}
			// 点击对应的 查找
			$('[data-search]').click(function(){
				var dataSearch =  $(this).attr('data-search');
				var searchPage = $('.search-page .' + dataSearch );
				$('#data-checkout').val(''); // 清空数据
				pub.dataPage = searchPage.empty().attr('data-page'); 
				pub.searchLoadMore.show().html( common.dataText( pub[pub.dataPage].isLast ) );
				pub[pub.dataPage].init();
				$('.newbuylist-page').hide().siblings('.search-page').show(); 
				searchPage.show().siblings('ul').hide(); 
				window.history.pushState({page:'search-page',title:'搜索'},'','#search-page');
			});
			// 点击搜索
			$('#checkout-btn').click(function(){
				pub[pub.dataPage].pageIndex = 1;
				pub[pub.dataPage].init();
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
			// 仓库处理新增
			$('#submit-btn').click(function(){
				var stock_sell_addJSON = pub.stock_sell_addJSON;
				var json = pub.json;
				$('#stock_sell_add-data-box').find('.serialize').each(function(i,v){
					stock_sell_addJSON[ v.name ] =  v.value;
				});
				if( !json.goodsId ){
					pub.dialog.show('请选择商品'); return;
				}
				if( stock_sell_addJSON.sellNum && !common.num.test( stock_sell_addJSON.sellNum ) ){
					pub.dialog.show('出货件数必须为整数'); return;
				}
				if( !stock_sell_addJSON.price ){
					pub.dialog.show('请填写商品原售价'); return;
				}
				if( !stock_sell_addJSON.sellPrice ){
					pub.dialog.show('请填写商品现售价'); return;
				}
				stock_sell_addJSON.stockerId = pub.stocker.id; // 用户ID
				stock_sell_addJSON.method = 'stock_sell_add';
				stock_sell_addJSON.goodsId = json.goodsId;
				stock_sell_addJSON.websiteNode = common.websiteNode;
				pub.apiHandle.stock_sell_add.init(); 
			});

			pub.dataBox.on('click','.delete-btn',function( e ){
				var $this = $(this);
				var i = $this.parents('.list').index();
				pub.stockSellId = pub.dataBox.data('stock_sell_list')[i].id;
				pub.dialog = common.dialog.init({
					btns : [  { klass : 'dialog-cancel-btn', txt:'取消'}, { klass : 'dialog-confirm-btn', txt : '确认'} ]
				});
				pub.dialog.show('确定删除该记录？',function(){
					pub.dialog = common.dialog.init();
				},function(){
					pub.dialog = common.dialog.init();
					pub.apiHandle.stock_sell_delete.init();
				});
				e.stopPropagation();
			})








		}
	};
	pub.init = function(){
		pub.apiHandle.stock_sell_list.init();
		pub.apiHandle.eventHandle.init();
	};
	module.exports = pub;
});