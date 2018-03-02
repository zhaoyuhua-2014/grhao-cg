/* 称重 + 待称重 */

define('weigh',['common'],function(require,exports,module){

	var pub = {};
	var common = require('common');

	pub.subMenuIndex = common.subMenuIndex.getItem(); // 索引

	pub.stocker = common.stocker.getItem(); // 仓管信息

	pub.title = ['待称重','已称重'][ pub.subMenuIndex-2 ];

	pub.loadMore = $('.loadMore');

	pub.dataBox = $('#buyer_bill_list-data-box'); // 数据盒子

	pub.dialog = common.dialog.init();

	pub.pageIndex = 1; // 索引
	
	pub.pageNo = common.pageNo;

	pub.json = {}; // 编辑接口数据

	pub.ulListBox = $('#ul-list-data-box'); 

	pub.serialize = [ 'instockNum','instockWeight','decPrice','otherMoney','checkMoney','note' ];

	// 父模块
	pub.apiHandle = {
		init : function(){},
		buyer_bill_list : {
			init : function( bool ){
				common.ajaxPost({
					method : 'buyer_bill_list',
					status :  pub.subMenuIndex-1, 
					isToday : 0,
					search : $('.search-input').val(), // 
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
					pub.loadMore.text( common.loadText );
				});
			}
		},
		buyer_bill_update : {
			init : function(){
				common.ajaxPost( pub.json, function( d ){
					if( d.statusCode == '100000' ){
						common.dialog.init().show('编辑成功',function(){
							window.history.back();
							pub.pageIndex = 1;
							pub.apiHandle.buyer_bill_list.init( true );
						});
					}else{
						pub.dialog.show( d.statusStr );
					}
				});
			}
		}
	};
	
	pub.init = function(){
		$('.weighed-page .header-box .title,title').html(pub.title);
		
		// 展示详情
		pub.dataBox.on('click','.list',function(){
			var i = $(this).index();
			$('#buylistdetail-data-box').html( $('#buylistdetail-data').tmpl( pub.dataBox.data('buyer_bill_list')[i] ) );
			$('.buylistdetail-page').show().siblings().hide();
			$('title').text('商品详情');
			window.history.pushState({page:'buylistdetail-page',title:'称重订单详情'},'','#buylistdetail-page');
		});
		$('.arrow.left').click(function(){
			window.history.back();
		});
		window.onpopstate = function( e ){
			// console.log(e.state);
			if( !e.state ){
				$('.weighed-page').show().siblings().hide();
			}
		}
		// 编辑
		pub.dataBox.on('click','.list .btn',function( e ){
			var i = $(this).parents('.list').index();
			var data = pub.dataBox.data('buyer_bill_list')[i];
			$('#disabled-data-box').html( $('#disabled-data').tmpl( data ) );
			pub.ulListBox.html( $('#ul-list-data').tmpl( data ) );
			$('.weighed-editor-page').show().siblings().hide();
			window.history.pushState({page:'weighed-editor-page',title:'称重订单编辑'},'','#weighed-editor-page');
			pub.dataId = data.id; // 采购单ID
			$('title,.weighed-editor-page .header-box .title').text( pub.title + '编辑' );
			e.stopPropagation();
		});
		// 点击加载更多
		pub.loadMore.click(function(){
			if( !pub.isLast ){
				pub.pageIndex++;
				pub.apiHandle.buyer_bill_list.init();
			}else{
				$(this).text('没有更多数据');
			}
		});
		// 搜索输入框
		$('.search-input').focus(function(){
			$(this).parents('.search-box').addClass('actived');
		});

		// 点击搜索
		$('.search-btn').click(function(){
			pub.pageIndex = 1;
			pub.apiHandle.buyer_bill_list.init( true );	
		});
		// 编辑提交
		$('#submit-btn').click(function(){
			var json = pub.json;
			pub.ulListBox.find('.serialize').each(function(i,v){
				json[ pub.serialize[i] ] = v.value;
			});
			if( !json.instockNum ){
				pub.dialog.show('请输入入库件数'); return;
			}
			if( !common.num.test( json.instockNum ) ){
				pub.dialog.show('库存件数必须为整数'); return;
			}
			if( !json.checkMoney ){
				pub.dialog.show('请输入核算总价'); return;
			}
			json.stockerId = pub.subMenuIndex == 1 ? pub.stocker.id : undefined;
			json.buyerBillId = pub.dataId;
			json.method = "buyer_bill_update";
			pub.apiHandle.buyer_bill_update.init();
		});
		pub.apiHandle.buyer_bill_list.init();
	}
	module.exports = pub;
});