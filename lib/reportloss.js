define('reportloss',['common'],function(require,exports,module){
	var common = require('common');
	var pub = {};

	// 记录分页状态

	pub.pageNo = common.pageNo;

	pub.pageIndex = 1; // 索引

	pub.isLast = null;

	pub.loadMore = $('.loadMore'); // 列表

	pub.searchLoadMore = $('.search-page .loadMore');

	pub.dialog = common.dialog.init();

	pub.dataBox = $('#report_loss_list-data-box');

	pub.stocker = common.stocker.getItem();

	pub.stock_sell_addJSON = {}; 

	pub.report_loss_addJSON = {}; 

	pub.lossTypeJSON = {
		'自然报损' : 2,
		'其他报损' : 9
	};
	pub.city = {
		init : function(){
			common.ajaxPost({
				method : 'business_city_list',
				search : $('#data-checkout').val() 
			},function( d ){
				if( d.statusCode == '100000' ){
					$('#city-list-data-box').html( $('#city-list-data').tmpl( d.data ) );
					pub.searchLoadMore.text( common.dataText( self.isLast  ) );
				}else{
					pub.dialog.show( d.statusStr );
				}
			},function(){},function(){
				pub.searchLoadMore.text(common.loadText);
			});
		}
	};
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
					pub.searchLoadMore.text( common.dataText( self.isLast  ) );
				}else{
					pub.dialog.show( d.statusStr );
				}
			},function(){},function(){
				pub.searchLoadMore.text(common.loadText);
			});
		}
	};

	pub.apiHandle = {
		report_loss_list : {
			init : function( bool ){
				common.ajaxPost({
					method : 'report_loss_list',
					search : $('.search-input').val(), // 
					websiteNode : pub.stocker.websiteNode, // 站点
					pageNo : pub.pageIndex,
					pageSize : pub.pageNo,
				},function( d ){
					switch( +d.statusCode ){
						case 100000 : (function(){
							pub.isLast = d.data.isLast;
							bool && pub.dataBox.removeData('report_loss_list').empty();
							pub.dataBox.append( $('#report_loss_list-data').tmpl( d.data.objects ) );
							pub.dataBox.data('report_loss_list', ( pub.dataBox.data('report_loss_list') || [] ).concat( d.data.objects )  );
							pub.loadMore.text( common.dataText( pub.isLast  ) );
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
					pub.loadMore.text( common.loadText );
				});
			}
		},
		stock_sell_add : {
			init : function(){
				common.ajaxPost(pub.stock_sell_addJSON,function( d ){
					if( d.statusCode == '100000' ){
						window.history.back();
						pub.pageIndex = 1;
						pub.apiHandle.report_loss_list.init( true );
					}else{
						pub.dialog.show( d.statusStr );
					}
				});
			}
		},
		stock_report_loss : {
			init : function( reportLossId ){
				common.ajaxPost({
					method : 'stock_report_loss',
					reportLossId : reportLossId
				},function( d ){
					if( d.statusCode == '100000'){
						$('#stock_sell_add-data-box').html( $('#stock_sell_add-data').tmpl( d.data ) );
					}else{
						pub.dialog.show( d.statusStr );
					}
				});
			}
		},
		report_loss_add : {
			init : function(){
				common.ajaxPost( pub.report_loss_addJSON, function( d ){
					if( d.statusCode == "100000" ){
						window.history.back();
						pub.pageIndex = 1;
						pub.apiHandle.report_loss_list.init( true );
					}else{
						pub.dialog.show( d.statusStr );
					}
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
				pub.apiHandle.report_loss_list.init( true );	
			});
			// 点击加载更多
			pub.loadMore.click(function(){
				if( !pub.isLast ){
					pub.pageIndex++;
					pub.apiHandle.report_loss_list.init();	
				}else{
					pub.loadMore.text( '没有更多数据' );
				}
			});
			// 展示详情
			pub.dataBox.on('click','.list',function(){
				var i = $(this).index();
				$('#buylistdetail-data-box').html( $('#buylistdetail-data').tmpl( pub.dataBox.data('report_loss_list')[i] ) );
				$('.buylistdetail-page').show().siblings().hide();
				window.history.pushState({page:'buylistdetail-page',title:'报损记录详情'},'','#buylistdetail-page');
			});

			pub.dataBox.on('click',' .list .btn',function( e ){
				var $this = $(this);
				var i = $this.parents('.list').index();
				$('.reportloss-sell-page').show().siblings().hide();
				pub.apiHandle.stock_report_loss.init( pub.dataBox.data('report_loss_list')[i].id ); // 调接口
				window.history.pushState({page:'reportloss-sell-page',title:'报损出售'},'','#reportloss-sell-page');
				e.stopPropagation();
			});

			// 报损出售
			$('#stock_sell_add-data-box').on('click','.oparation-btn',function(){
				var $this = $(this);
				var parentNode = $this.parents('#stock_sell_add-data-box');
				var stock_sell_addJSON = pub.stock_sell_addJSON;
				parentNode.find('.serialize').each(function(i,v){
					stock_sell_addJSON[ v.name ] =  v.value;
				});
				stock_sell_addJSON.stockerId = pub.stocker.id; // 用户ID
				stock_sell_addJSON.method = 'stock_sell_add';
				// console.log( stock_sell_addJSON );
				if( !stock_sell_addJSON.sellWeight ){
					pub.dialog.show('请填写出货重量'); return;
				}
				if( stock_sell_addJSON.sellNum && !common.num.test( stock_sell_addJSON.sellNum ) ){
					pub.dialog.show('出货件数必须为整数'); return;
				}
				if( !stock_sell_addJSON.sellPrice ){
					pub.dialog.show('请填写商品售价'); return;
				}
				pub.apiHandle.stock_sell_add.init(); 
			});
			// 新建
			$('#add-newbuy').click(function(){
				pub.json = {};
				$('.search-input').val('');
				$('.newbuylist-page').show().siblings().hide();
				$('title').html('新建报损记录');
				$('.newbuylist-page li').find('input,textarea').not('#website-city').val('');
				window.history.pushState({page:'newbuylist-page',title:'新建报损记录'},'','#newbuylist-page');
			});

			pub.ulListBox = $('#ul-list-box');
			pub.ulListBox.on('click','.slideDown',function( e ){
				var $this=$(this);
				var target = e.target;
				$this.find('div').slideToggle();
				target.className == 'p1' && $this.find('input').val( $(target).text() );
			});
			// 点击对应的 查找
			$('[data-search]').click(function(){
				var dataSearch =  $(this).attr('data-search');
				pub.searchPage = $('.search-page .' + dataSearch );
				$('#data-checkout').attr('placeholder',{
					'goods-list' : '请输入搜索的商品名称'
				}[ dataSearch ]).val(''); // 清空数据
				pub.dataPage = pub.searchPage.empty().attr('data-page'); // 取出对应的 city-list, buyer-list等
				pub.searchLoadMore.show().html( common.dataText( pub[pub.dataPage].isLast  ) );
				pub[pub.dataPage].init();
				$('.newbuylist-page').hide().siblings('.search-page').show(); // 页面切换
				pub.searchPage.show().siblings('ul').hide(); // 查询列表切换
				window.history.pushState({page:'search-page',title:'搜索'},'','#search-page');
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
				// console.log(className,pub.dataId);
				var json = pub.json;
				switch( className ){
					// case 'city-list' : json.websiteNode = pub.dataId; break;
					case 'goods-list' : json.goodsId = pub.dataId; break;
					case 'buyer-list' : json.buyerId = pub.dataId; break;
					case 'supplier-list' : json.preSupplierId = pub.dataId; break;
				};
				window.history.back();
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
			pub.searchLoadMore.click(function(){
				var node = $(this).parents('[module-id]');
				if( !pub[pub.dataPage].isLast ){
					pub[pub.dataPage].pageIndex++;
					pub[pub.dataPage].init();
				}else{
					node.find('.loadMore').html('没有更多数据');
				}
			});


			// 添加报损记录保存
			$('#submit-btn').click(function(){

				pub.report_loss_addJSON = {};
				var report_loss_addJSON = pub.report_loss_addJSON;
				pub.ulListBox.find('.serialize').each(function(i,v){
					var value = v.value;
					if(  v.name == 'lossType' ){
						value = pub.lossTypeJSON[ value ];
					}
					report_loss_addJSON[ v.name ] = value;
				});
				// console.log( report_loss_addJSON )
				// if( !pub.json.websiteNode ){
				// 	pub.dialog.show('请选择站点城市'); return;
				// }
				if( !pub.json.goodsId ){
					pub.dialog.show('请选择商品'); return;
				}
				if( !report_loss_addJSON.lossWeight && !report_loss_addJSON.lossNum  ){
					pub.dialog.show('请填写商品重量或者件数'); return;
				}
				if( report_loss_addJSON.lossNum && !common.num.test( report_loss_addJSON.lossNum ) ){
					pub.dialog.show('报损件数必须为整数'); return;
				}
				if( !report_loss_addJSON.lossType ){
					pub.dialog.show('请选择报损类型'); return;
				}
				if( !report_loss_addJSON.note ){
					pub.dialog.show('请输入报损说明'); return;
				}
				report_loss_addJSON.stockerId = pub.stocker.id;
				report_loss_addJSON.method = 'report_loss_add';
				report_loss_addJSON.websiteNode = common.websiteNode;
				report_loss_addJSON.goodsId = pub.json.goodsId;

				pub.apiHandle.report_loss_add.init();


			});














			// 回退
			$('.arrow.left').click(function(){
				window.history.back();
			});
			window.onpopstate = function( e ){
				console.log(e.state);
				if( !e.state ){
					$('.stock-reportloss-page').show().siblings().hide();
				}else{
					$('.newbuylist-page').show().siblings().hide();
				}
			}
			// window.onpopstate = function( e ){

			// 	// if( !e.state ){
			// 	// 	$('.stock-reportloss-page').show().siblings().hide();
			// 	// }
			// }



		}
	};

	pub.init = function(){
		pub.apiHandle.report_loss_list.init();
		pub.apiHandle.eventHandle.init();
	};
	module.exports = pub;
});