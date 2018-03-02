define('update',['common'],function(require,exports,module){

	var pub = {};
	var common = require( 'common' );

	pub.pageIndex = 1;

	pub.pageNo = common.pageNo;

	pub.dialog = common.dialog.init(); // 弹窗

	pub.loadMore = $('.loadMore');

	pub.dataBox = $('#goods_update_rcd_list-data-box');

	pub.subMenuIndex = common.subMenuIndex.getItem() - 5; // 索引值

	pub.title = ['待审上新记录','待审更新记录'][ pub.subMenuIndex ]; // title

	pub.ulListBox = $('#ul-list-data-box');

	pub.json = {};

	pub.serialize = [ 'suggestPrice','roughWeight','netWeight','singleNutWeight','outPeel','marketStock','isSpecial','isOff','goodsShows','otherNote'];

	pub.isAndNo = { '否' : 0, '是' : 1 };

	pub.apiHandle = {
		goods_update_rcd_list : {
			init : function( bool ){
				common.ajaxPost({
					method : 'goods_update_rcd_list',
					search : $('.search-input').val(), // 
					isNewGoods : !pub.subMenuIndex ? 1 : 0, // 区分状态 0, 更新，1，上新 
					pageNo : pub.pageIndex,
					pageSize : pub.pageNo,
				},function( d ){
					switch( +d.statusCode ){
						case 100000 : (function(){
							pub.isLast = d.data.isLast;
							bool && pub.dataBox.removeData('goods_update_rcd_list').empty();
							pub.dataBox.append( $('#goods_update_rcd_list-data').tmpl( d.data.objects ) );
							pub.dataBox.data('goods_update_rcd_list', ( pub.dataBox.data('goods_update_rcd_list') || [] ).concat( d.data.objects )  );
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
		goods_update_rcd_update : {
			init : function(){
				common.ajaxPost(pub.json,function( d ){
					d.statusCode == '100000' ? (function(){
						common.dialog.init().show('更新成功',function(){
							window.history.back();
							pub.pageIndex = 1;
							pub.apiHandle.goods_update_rcd_list.init( true );
						});
					})() : pub.dialog.show( d.statusStr );
				});
			}
		}
		
	};



	pub.eventHandle = {
		init : function(){
			// 回退
			$('.arrow.left').click(function(){
				window.history.back();
			});
			window.onpopstate = function( e ){
				!e.state && $('.stock-reportloss-page').show().siblings().hide();
			}
			$('.search-input').focus(function(){
				$(this).parents('.search-box').addClass('actived');
			});

			// 搜索按钮
			$('.search-btn').click(function(){
				pub.pageIndex = 1;
				pub.apiHandle.goods_update_rcd_list.init( true );	
			});
			pub.loadMore.click(function(){
				if( !pub.isLast ){
					pub.pageIndex++;
					pub.apiHandle.goods_update_rcd_list.init();
				}else{
					pub.loadMore.text('没有更多数据');
				}
			});
			// 展示详情
			pub.dataBox.on('click','.list',function(){
				var i = $(this).index();
				$('#buylistdetail-data-box').html( $('#buylistdetail-data').tmpl( pub.dataBox.data('goods_update_rcd_list')[i] ) );
				$('.buylistdetail-page').show().siblings().hide();
				$('title').text('商品详情');
				window.history.pushState({page:'buylistdetail-page',title:'商品更新记录详情'},'','#buylistdetail-page');
			});

			pub.dataBox.on('click','.list .btn',function( e ){
				var i = $(this).parents('.list').index();
				var data = pub.dataBox.data('goods_update_rcd_list')[i];
				pub.dataId = data.id;
				$('#disabled-data-box').html( $('#disabled-data').tmpl( data ) );
				pub.ulListBox.html( $('#ul-list-data').tmpl( data ) );
				window.history.pushState({page:'weighed-editor-page',title:'称重订单编辑'},'','#weighed-editor-page');
				$('.weighed-editor-page').show().siblings().hide();
				pub.subMenuIndex == 0 && pub.ulListBox.find('.slideDown').eq(1).hide(); // 隐藏是否下架
				e.stopPropagation();

			});
			pub.ulListBox.on('click','.slideDown',function( e ){
				var $this=$(this);
				var target = e.target;
				$this.find('div').slideToggle();
				target.className == 'p1' && $this.find('input').val( $(target).text() );
			});
			$('#submit-btn').click(function(){
				var json = pub.json;
				pub.ulListBox.find('.serialize').each(function(i,v){
					json[ pub.serialize[i] ] = v.value;
				});
				if( json.marketStock && !common.num.test( json.marketStock ) ){
					pub.dialog.show('市场限购数量必须为整数'); return;
				}
				// marketStock
				json.isSpecial = pub.isAndNo[ json.isSpecial ];
				json.isOff = pub.subMenuIndex == 0 ? undefined : pub.isAndNo[ json.isOff ];
				json.goodsRcdId = pub.dataId;
				json.method = 'goods_update_rcd_update';
				pub.apiHandle.goods_update_rcd_update.init();
			});
		}
	};
	pub.init = function(){
		pub.apiHandle.goods_update_rcd_list.init();
		pub.eventHandle.init();
		$('title,.stock-reportloss-page .header-box .title').html( pub.title );
	};
	module.exports = pub;

});