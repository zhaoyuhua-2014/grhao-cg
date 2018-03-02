/* 申诉和账单 */
define('verifybill',['common'],function(require,exports,module){
	var pub = {};
	var common = require( 'common' );

	pub.dialog = common.dialog.init();

	pub.pageNo = common.pageNo;

	pub.pageIndex = 1;

	pub.loadMore = $('.verifybill-content .loadMore');
	pub.dataBox = $('#check_bill_list-data-box');

	pub.status = -1; // 申诉列表状态


	pub.apiHandle = {
		check_bill_list : {
			init : function( bool ){
				common.ajaxPost({
					method : 'check_bill_list',
					search : $('.search-input').val(), // 
					pageNo : pub.pageIndex,
					pageSize : pub.pageNo,
					status : pub.status
				},function( d ){
					if( d.statusCode == '100000' ){
						pub.isLast = d.data.isLast;
						bool && pub.dataBox.removeData('check_bill_list').empty();
						pub.dataBox.append( $('#check_bill_list-data').tmpl( d.data.objects ) );
						pub.dataBox.data('check_bill_list', ( pub.dataBox.data('check_bill_list') || [] ).concat( d.data.objects )  );
						pub.loadMore.text( common.dataText( pub.isLast ) );
					}else{
						pub.dialog.show( d.statusStr );
					}
				},function(){},function(){
					pub.loadMore.text( common.loadText );
				});
			}
		}
	};

	pub.eventHandle = {
		init : function(){
			$('.arrow.left').click(function(){
				window.history.back();
			});
			window.onpopstate = function( e ){
				if( !e.state ){
					$('.verifybill-page').show().siblings().hide();
				}
			}
			// 搜索输入框
			$('.search-input').focus(function(){
				$(this).parents('.search-box').addClass('actived');
			});
			// 点击搜索
			$('.search-btn').click(function(){
				pub.pageIndex = 1;
				pub.apiHandle.check_bill_list.init( true );	
			});
			// 展示详情
			pub.dataBox.on('click','.list',function(){
				var i = $(this).index();
				$('#buylistdetail-data-box').html( $('#buylistdetail-data').tmpl( pub.dataBox.data('check_bill_list')[i] ) );
				$('.buylistdetail-page').show().siblings().hide();
				$('title').text('商品详情');
				window.history.pushState({page:'buylistdetail-page',title:'核账单详情'},'','#buylistdetail-page');
			});
			// 点击加载更多
			pub.loadMore.click(function(){
				if( !pub.isLast ){
					pub.pageIndex++;
					pub.apiHandle.check_bill_list.init();
				}else{
					$(this).text('没有更多数据');
				}
			});
		}
	};

	pub.init = function(){
		pub.apiHandle.check_bill_list.init();
		pub.eventHandle.init(); // 事件初始化

	};


	module.exports = pub;

});
