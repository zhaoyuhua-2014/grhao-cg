define('returngoods',['common'],function(require,exports,module){
	var common = require('common');
	var pub = {};

	// 记录分页状态

	pub.pageNo = common.pageNo;

	pub.pageIndex = 1; // 索引

	pub.isLast = null;

	pub.loadMore = $('.loadMore');

	pub.searchLoadMore = $('.search-page .loadMore');

	pub.dialog = common.dialog.init();

	pub.dataBox = $('#goods_refund_list-data-box');

	pub.stocker = common.stocker.getItem(); // 仓管信息

	pub.websiteNode = pub.stocker.websiteNode; // 站点

	pub.isAndNo = { '通过' : 1, '不通过' : -1 }; // 通过 + 不通过 

	pub.editJSON = {};
	pub.addJSON = {};

	// 
	pub.goods = {
		pageIndex : 1,
		isLast : false,
		init : function(){
			var self = this;
			common.ajaxPost({
				method : 'order_goods_list',
				ordercode : pub.json.preSupplierId, // 订单编码
				websiteNode : -1,
				pageNo : self.pageIndex,
				pageSize : pub.pageNo,
				search : $('#data-checkout').val()
			},function( d ){
				if( d.statusCode == '100000' ){
					self.isLast = d.data.isLast;
					$('#goods-list-data-box').append( $('#goods-list-data').tmpl( d.data ) );
					pub.searchLoadMore.text( common.dataText( self.isLast ) );
				}else{
					pub.dialog.show( d.statusStr );
				}
			},function(){},function(){
				pub.searchLoadMore.text(common.loadText);
			});
		}
	};
	// 退货商家
	pub.buyer = {
		pageIndex : 1,
		isLast : false,
		init : function(){
			var self = this;
			common.ajaxPost({
				method : 'firm_list',
				// websiteNode : pub.json.websiteNode,
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
	// 所属订单
	pub.supplier = {
		pageIndex : 1,
		isLast : false,
		init : function(){
			var self = this;
			common.ajaxPost({
				method : 'order_list',
				shopEntity : pub.json.buyerId, // 商家ID
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
	pub.apiHandle = {
		goods_refund_list : {
			init : function( bool ){
				common.ajaxPost({
					method : 'goods_refund_list',
					websiteNode : pub.websiteNode,
					pageNo : pub.pageIndex,
					pageSize : common.pageNo,
					search : $('.search-input').val()
				},function( d ){
					if( d.statusCode == '100000' ){
						pub.isLast = d.data.isLast;
						bool && pub.dataBox.removeData('goods_refund_list').empty();
						pub.dataBox.append( $('#goods_refund_list-data').tmpl( d.data.objects ) );
						pub.dataBox.data('goods_refund_list', ( pub.dataBox.data('goods_refund_list') || [] ).concat( d.data.objects )  );
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
		goods_refund_check : {
			init : function(){
				common.ajaxPost(pub.editJSON,function( d ){
					if( d.statusCode == '100000' ){
						window.history.back();
						pub.pageIndex = 1;
						pub.apiHandle.goods_refund_list.init( true );
					}else{
						pub.dialog.show( d.statusStr );
					}
				});
			}
		},
		goods_refund_add : {
			init : function(){
				common.ajaxPost(pub.addJSON,function( d ){
					if( d.statusCode == '100000' ){
						window.history.back();
						pub.pageIndex = 1;
						pub.apiHandle.goods_refund_list.init( true );
					}else{
						pub.dialog.show( d.statusStr );
					}
				});
			}
		}
	};

	pub.eventHandle = {
		init : function(){
			$('.search-input').focus(function(){
				$(this).parents('.search-box').addClass('actived');
			});
			// 搜索按钮
			$('.search-btn').click(function(){
				pub.pageIndex = 1;
				pub.apiHandle.goods_refund_list.init( true );	
			});
			// 点击加载更多
			pub.loadMore.click(function(){
				if( !pub.isLast ){
					pub.pageIndex++;
					pub.apiHandle.goods_refund_list.init();
				}else{
					pub.loadMore.text( '没有更多数据' );
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
			// 展示详情
			pub.dataBox.on('click','.list',function(){
				var i = $(this).index();
				var data = pub.dataBox.data('goods_refund_list')[i];
				$('#buylistdetail-data-box').html( $('#buylistdetail-data').tmpl( data ) );
				$('.buylistdetail-page').show().siblings().hide();
				window.history.pushState({page:'buylistdetail-page',title:'退货待审核详情'},'','#buylistdetail-page');
			});
			pub.dataBox.on('click','.list .btn',function( e ){
				var $this = $(this);
				var i = $this.parents('.list').index();
				var data = pub.dataBox.data('goods_refund_list')[i];
				pub.dataId = data.id;
				$('.weighed-editor-page').show().siblings().hide();
				$('#stock-returngoods-edit-data-box').html( $('#stock-returngoods-edit-data').tmpl( pub.dataBox.data('goods_refund_list')[i] ) );
				window.history.pushState({page:'weighed-editor-page',title:'退货待审核编辑'},'','#weighed-editor-page');
				e.stopPropagation();
			});
			// 审核处理
			pub.editDataBox = $('#stock-returngoods-edit-data-box'); // 编辑盒子
			pub.editDataBox.on('click','.slideDown',function( e ){
				var $this=$(this);
				var target = e.target;
				$this.find('div').slideToggle();
				target.className == 'p1' && $this.find('input').val( $(target).text() );
			});
			pub.editDataBox.on('click','#submit-btn',function(){
				pub.editJSON = {};
				var editJSON = pub.editJSON;
				pub.editDataBox.find('.serialize').each(function(i,v){
					var value = v.value;
					if( v.name == 'status' ){
						value = pub.isAndNo[value];	
					}
					pub.editJSON[v.name] = value;
				});
				if( !editJSON.status ){
					pub.dialog.show('请选择审核否通过');return;
				}
				editJSON.stockerId = pub.stocker.id;
				editJSON.goodsRefundId = pub.dataId;
				pub.apiHandle.goods_refund_check.init();
			});




			// 新建
			$('#add-newbuy').click(function(){
				pub.json = {};
				$('.search-input').val('');
				$('.newbuylist-page').show().siblings().hide();
				$('title').html('新增退货记录');
				$('.newbuylist-page li').find('input,textarea').val('');
				window.history.pushState({page:'newbuylist-page',title:'新建仓库处理记录'},'','#newbuylist-page');
			});

			$('#submit-btn1').click(function( e ){

				pub.addJSON = {};
				var pjson = pub.json;

				if( !pjson.buyerId ){ // 退货商家ID
					pub.dialog.show('请选择退货商家'); return;
				}
				if( !pjson.preSupplierId ){
					pub.dialog.show('请选择所属订单'); return;
				}
				if( !pjson.goodsId ){
					pub.dialog.show('请选择商品名称'); return;
				}
				var json = pub.addJSON;
				json.goodsId = pjson.goodsId; // 商品ID
				json.goodsOrderCode = pjson.preSupplierId; // 订单编码 
				json.method = 'goods_refund_add';
				$('.newbuylist-page .serialize').each(function(i,v){
					json[v.name] = v.value;
				});
				if( json.initNum && !common.num.test( json.initNum ) ){
					pub.dialog.show('退还商品件数必须为整数'); return;
				}
				pub.apiHandle.goods_refund_add.init();
			});
			// 回退
			$('.arrow.left').click(function(){
				window.history.back();
			});
			window.onpopstate = function( e ){
				// console.log(e.state);
				if( !e.state ){
					$('.stock-returngoods-page').show().siblings().hide();
				}else{
					$('.newbuylist-page').show().siblings().hide();
				}
			}
			// 点击对应的 查找
			$('[data-search]').click(function(){
				var dataSearch =  $(this).attr('data-search');
				pub.searchPage = $('.search-page .' + dataSearch );
				$('#data-checkout').attr('placeholder',{
					'buyer-list' :'请输入搜索的退货商家名称',
					'supplier-list' : '请输入搜索的订单编号',
					'goods-list' : '请输入搜索的商品名称'
				}[dataSearch]).val(''); // 清空数据
				pub.dataPage = pub.searchPage.empty().attr('data-page'); // 取出对应的 city-list, buyer-list等
				if( dataSearch != 'buyer-list' ){
					if( $('[data-search="buyer-list"]').find('input').val() == '' ){
						pub.dialog.show('请选择退货商家'); return;
					}
					pub.searchLoadMore.show().html( common.dataText( pub[pub.dataPage].isLast ) );
				}
				pub[pub.dataPage].init();
				$('.newbuylist-page').hide().siblings('.search-page').show(); // 页面切换
				pub.searchPage.show().siblings('ul').hide(); // 查询列表切换
				window.history.pushState({page:'search-page',title:'搜索'},'','#search-page');
			});
			// 点击搜索
			$('#checkout-btn').click(function(){
				pub[pub.dataPage].pageIndex = 1;
				pub.searchPage.empty(); // 清空
				pub[pub.dataPage].init();
			});

			// 选值操作
			$('.search-page .search-content').on('click','[data-id]',function(){
				var $this = $(this);
				pub.dataId = $this.attr('data-id');
				pub.name = $this.attr('data-name');
				var parentNode = $this.parents('[data-page]');
				var className = parentNode.attr('class');

				$('.search-page').hide().siblings('.newbuylist-page').show();
				$('[data-search=' + className + ']').find('input').val( pub.name );
				// console.log(className,pub.dataId);
				switch( className ){
					// case 'city-list' : pub.json.websiteNode = pub.dataId; break;
					case 'goods-list' : pub.json.goodsId = pub.dataId; break;
					case 'buyer-list' : pub.json.buyerId = pub.dataId; break; // 商家ID
					case 'supplier-list' : pub.json.preSupplierId = pub.dataId; break; // 订单编码
				};
				window.history.back();
			});
		}
	};
	pub.init = function(){
		pub.apiHandle.goods_refund_list.init();
		pub.eventHandle.init();
	};
	module.exports = pub;
});