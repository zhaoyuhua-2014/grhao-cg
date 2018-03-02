define('everyday',['common'],function(require,exports,module){
	var common = require('common');
	var pub = {};

	// 记录分页状态

	pub.pageNo = common.pageNo;

	pub.pageIndex = 1; // 索引

	pub.isLast = null;

	pub.loadMore = $('.loadMore');

	pub.apiArr = ['stock_rcd_month_list','stock_rcd_yes_list','stock_rcd_list'];

	pub.title = ['每月进销报表','昨日进销报表','历史进销报表'];

	pub.subMenuIndex = common.subMenuIndex.getItem(); // 索引

	pub.index = pub.subMenuIndex - 11;

	pub.dialog = common.dialog.init();

	pub.stocker = common.stocker.getItem();
	
	pub.json = {}; // json
	
	pub.dataBox = $('#list-data-box');
	pub.apiHandle = {
		init : function( bool ){
			common.ajaxPost({
				method : pub.apiArr[ pub.index ],
				search : $('.search-input').val(),
				websiteNode : pub.stocker.websiteNode,
				pageNo : pub.pageIndex,
				pageSize : pub.pageNo,
			},function( d ){
				pub.isLast = d.data.isLast;
				bool && pub.dataBox.removeData('list').empty();
				pub.dataBox.append( $('#list-data').tmpl( d.data.objects ) );
				pub.dataBox.data('list', ( pub.dataBox.data('list') || [] ).concat( d.data.objects )  );
				pub.loadMore.text( common.dataText( pub.isLast ) );
			},function( d ){
				pub.dialog.show( d.statusStr );
				pub.loadMore.hide();
			},function(){
				pub.loadMore.text( common.loadText );	
			});
		}
	}
	pub.eventHandle = {
		init : function(){
			$('.search-input').focus(function(){
				$(this).parents('.search-box').addClass('actived');
			});
			// 搜索按钮
			$('.search-btn').click(function(){
				pub.pageIndex = 1;
				pub.apiHandle.init( true );
			});
			// 点击加载更多
			pub.loadMore.click(function(){
				if( !pub.isLast ){
					pub.pageIndex++;
					pub.apiHandle.init();
				}else{
					pub.loadMore.text('没有更多数据');
				}
			});
			// 展示详情
			pub.dataBox.on('click','.list',function(){
				var i = $(this).index();
				$('#buylistdetail-data-box').html( $('#buylistdetail-data'+( pub.index != 0 ? '' : '2')  ).tmpl( pub.dataBox.data('list')[i] ) );
				$('.buylistdetail-page').show().siblings().hide()
				window.history.pushState({page:'buylistdetail-page',title:'进销报表详情'},'','#buylistdetail-page');
			});
			// 回退
			$('.arrow.left').click(function(){
				window.history.back();
			});
			window.onpopstate = function( e ){
				if( !e.state ){
					$('.stock-everyday-page').show().siblings().hide();
				}
			}
			$('title,.title').html( pub.title[ pub.index ] );
		}
	};

	pub.init = function(){
		pub.apiHandle.init();
		pub.eventHandle.init();
	};
	module.exports = pub;
});