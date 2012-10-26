APIBrowser = WSClient.child();
	// constructor, set initial values and initiate connection
	APIBrowser.prototype.__init__ = function()
	{
		this.WSmethods = ['ServerModel', 'SavedCM'];
		this.serverModel = [];
		this.clientModel = [];
		this.savedCM = {
			'cookiedata' : [],
			'serverdata' : []
			};
		
		createCookie('APIBrowser_ClientID', this.cid);
		this.setUpInterface();
		
		this.toggleWorking();//off
	};
	
	// set up the GUI interface controls
	APIBrowser.prototype.setUpInterface = function()
	{
		var mirror = this;
		$('#container-tblModel').toggle();
		
		/********** NAVBAR TOP *************/
		
		// connect button
		var $btnConnect = $('#btn-connect');
		$btnConnect.click(function(){
			// connect to the websocket server
			mirror.toggleWorking(); //on
			$btnConnect.unbind('click').addClass('disabled').html('Connecting...');
			WSClient.prototype.__init__.call(mirror, mirror.WSmethods);
		});
		
		// help modal window
		$('#btn-help').click(function(){
			$(this).parent().addClass('active');
			$('#helpModal').modal({'show':false, 'backdrop':false});
		});
		$('#helpModal').on('hidden', function(){
			$('#helpModal').modal('hide');
			$('#btn-help').parent().removeClass('active');
		});
		$('#helpModal').toggle();
		
		// settings modal window
		$('#btn-settings').click(function(){
			$(this).parent().addClass('active');
			$('#settingsModal').modal({'show':false, 'backdrop':false});
		});
		$('#settingsModal').on('hidden', function(){
			$('#settingsModal').modal('hide');
			$('#btn-settings').parent().removeClass('active');
		});
		$('#settingsModal').toggle();
		
		// model dropdown menu items
		$('#mnu-model-select').click(function(){
			if (mirror.isChannelOpen())
			{
				mirror.hideAllMain();
				$('#container-tblModel').slideToggle('slow');
			}
			else
			{
				mirror.alert('You are not connected to the server', 'error');
			}
		});
		
		/********* MAIN AREA INTERFACE *************/
		
		// select elements of server model for inspection
		$('#btn-selectModel').click(function(){
			mirror.toggleWorking(); //on
			mirror.clientModel = [];
			for (var i=0; i<mirror.serverModel.length; i++)
			{
				if ($('#chkbx-serverModel-'+i).attr('checked') == 'checked')
				{
					mirror.clientModel.push(mirror.serverModel[i]);
				}
			}
			mirror.savedCM = {
				'cookiedata' : mirror.clientModel,
				'serverdata' : mirror.clientModel
				};
			createCookie('APIBrowser_ClientModel_'+mirror.cid, JSON.stringify(mirror.clientModel));
			mirror.send('SaveCM', mirror.clientModel);
			mirror.alert('Client model saved to the server and the cookie.');
			mirror.hideAllMain();
			mirror.toggleWorking(); //off
		});
		
		
		/********** SAVED DATA WINDOW ***********/
		
		// saved data window toggle
		var $savedData = $('#savedData');
		$savedData.toggle();
		$('#btn-savedData').click(function(){
			$savedData.slideToggle('fast', function(){
				$('#btn-savedData').html($(this).is(':visible')?' <i class="icon-chevron-up"></i>Saved Data':' <i class="icon-chevron-down"></i>Saved Data');
			});
		});
		
		// select all save methods
		$('#btn-SelectAllCMSaves').click(function(){
			$savedData.find('input').attr('checked','checked');
		});
		
		// deselect all save methods
		$('#btn-DeselectAllCMSaves').click(function(){
			$savedData.find('input').removeAttr('checked');
		});
		
		// clear selected data
		$('#btn-ClearCMSaves').click(function(){
			$savedData.find('input').each(function(){
				if($(this).attr('checked') == 'checked')
				{
					var type = $(this).attr('id').split('-')[1];
					mirror.savedCM[type] = [];
					if(type == 'cookiedata') // TODO get rid of this nonsense and abstract saved cm
					{
						eraseCookie('APIBrowser_ClientModel_'+mirror.cid);
					}
					else
					{
						mirror.send('DeleteCM');
					}
				}
			});
		});
		
		// restore from selected data
		$('#btn-RestoreCMSaves').click(function(){
			var restoreFrom = false;
			$savedData.find('input').each(function(){
				if($(this).attr('checked') == 'checked')
				{
					if (restoreFrom)
					{
						alert('Choose only one Client Model to restore from.');
						restoreFrom = false;
					}
					else
					{
						restoreFrom = $(this).attr('id').split('-')[1];
					}
				}
			});
			if (restoreFrom)
			{
				mirror.clientModel = mirror.savedCM[restoreFrom];
				for (var i=0; i<mirror.serverModel.length; i++)
				{
					if (jQuery.inArray(mirror.serverModel[i], mirror.clientModel) > -1)
					{
						$('#chkbx-serverModel-'+i).attr('checked','checked');
					}
					else
					{
						$('#chkbx-serverModel-'+i).removeAttr('checked');
					}
				}
				mirror.alert('Client model restored from ' + restoreFrom.replace(/data/g, ''));
			}
		});
		
		// force refresh of selected data
		var cookieDataRefresh = this.getCookieDataRefresh();
		var serverDataRefresh = this.getServerDataRefresh();
		$('#btn-RefreshCMSaves').click(function(){
			$savedData.find('input').each(function(){
				if($(this).attr('checked') == 'checked')
				{
					if($(this).attr('id').split('-')[1] == 'cookiedata') // TODO get rid of this nonsense and abstract saved cm
					{
						cookieDataRefresh();
					}
					else
					{
						serverDataRefresh();
					}
				}
			});
		});
		
		// set timers to refresh saved data automatically
		this.timer_cookiedata = setInterval(cookieDataRefresh, INTERVAL_COOKIEDATA * 1000);
		this.timer_serverdata = setInterval(serverDataRefresh, INTERVAL_SERVERDATA * 1000);
	};
	
	/*********** MISC INTERFACE METHODS ***********/
	
	
	// show an alert message
	APIBrowser.prototype.alert = function(msg, type)
	{
		$alerts = $('#alerts');
		var $newDiv = $('<div class="alert"><span class="badge">&times;</span><button type="button" class="close" data-dismiss="alert">&times;</button><b></b></div>');
		$newDiv.toggle(false);
		if (def(type,false))
		{
			$newDiv.addClass('alert-'+type);
			$newDiv.children('span').addClass('badge-'+((type=='error')?'warning':type)); // TODO the colors are all wrong
		}
		$newDiv.children('b').text(msg);
		$alerts.prepend($newDiv);
		$newDiv.slideToggle('fast');
		this.alertCountdown($newDiv, INTERVAL_HIDEALERTS + 1);
	};
	
	// display a counter next to the alert and fade it when the counter stops
	APIBrowser.prototype.alertCountdown = function($alert, timer)
	{
		var mirror = this;
		if (timer == 0)
		{
			$alert.fadeOut('fast');
		}
		else
		{
			timer--;
			$alert.children('span').text(timer);
			setTimeout(function(){
				mirror.alertCountdown($alert, timer);
			}, 1000);
		}
	};
	
	// return the function for refreshing data stored in a cookie
	APIBrowser.prototype.getCookieDataRefresh = function()
	{
		var mirror = this;
		var $savedData = $('#savedData');
		return function()
		{
			if ($savedData.is(':hidden'))
			{
				return null;
			}
			var cookievalue = readCookie('APIBrowser_ClientModel_'+mirror.cid);
			mirror.savedCM['cookiedata'] = (cookievalue) ? jQuery.parseJSON(cookievalue) : [];
			mirror.savedCMtoString('cookiedata');
		};
	};
	
	// return the function for refreshing data stored in a cookie
	APIBrowser.prototype.getServerDataRefresh = function()
	{
		var mirror = this;
		var $savedData = $('#savedData');
		return function()
		{
			if (mirror.isChannelOpen() && $savedData.is(':visible'))
			{
				mirror.send('GetSavedCM');
				$('#serverdata').html('Requested...');
			}
		};
	};
	
	// write the representation of saved client model data // TODO more fancy
	APIBrowser.prototype.savedCMtoString = function(dataType)
	{
		var repr = (this.savedCM[dataType].length > 0) ? this.savedCM[dataType].join(', ') : '';
		$('#'+dataType).html(repr);
	};
	
	// toggle the "working" label
	APIBrowser.prototype.toggleWorking = function()
	{
		$('#label-working').css('left', Math.round($(document).width()/2) - Math.round($('#label-working').width()/2)); // reposition
		$('#label-working').slideToggle('fast');
	};
	
	// hide all main area containers
	APIBrowser.prototype.hideAllMain = function()
	{
		$('.m-a-c').slideUp('slow');
	};
	
	/************** MISC **************/
	
	// connection has been established to the server
	APIBrowser.prototype.onOpen = function()
	{
		var mirror = this;
		
		// modify the connection button
		var $btnConnect = $('#btn-connect');
		$btnConnect.removeClass('disabled btn-primary').addClass('btn-success').html('Disconnect');
		$btnConnect.click(function(){
			// disconnect from the websocket server
			$btnConnect.unbind('click').removeClass('btn-success').addClass('disabled btn-primary').html('Disconnecting...');
			mirror.channel.disconnect();
		});
		
		// send authentication request to the server
		this.send('Auth');
	};
	
	// connection has been lost
	APIBrowser.prototype.onClose = function()
	{
		var mirror = this;
		var $btnConnect = $('#btn-connect');
		$btnConnect.removeClass('btn-success disabled').addClass('btn-primary').html('Connect');
		$btnConnect.click(function(){
			// connect to the websocket server
			$btnConnect.unbind('click').addClass('disabled').html('Connecting...');
			WSClient.prototype.__init__.call(mirror, mirror.WSmethods);
		});
	};
	
	// an error has occured
	APIBrowser.prototype.onError = function(msg)
	{
		this.alert(msg, 'error');
	};
	
	// print a message in console with a time sig
	APIBrowser.prototype.log = function(msg)
	{
		var t = new Date();
		console.log('['+t.getHours()+':'+t.getMinutes()+':'+t.getSeconds()+':'+t.getMilliseconds()+'] '+msg);
	};
	
	
	/*** BELOW METHODS CALLED AUTOMATICALLY WITH REGISTERED CALLBACKS ***/
	
	
	// receive list of available items in the server model
	APIBrowser.prototype.ServerModel = function(servermodel)
	{
		this.serverModel = servermodel;
		
		var $tblModel = $('#tblModel');
		var tmp = Array();
		for (var i=0; i<servermodel.length; i++)
		{
			tmp.push('<tr><td><label class="checkbox"><input type="checkbox" id="chkbx-serverModel-'+i+'">');
			tmp.push(servermodel[i]);
			tmp.push('</label></td></tr>');
		}
		$tblModel.html(tmp.join(''));
		$('#container-tblModel').slideToggle('slow');
		this.toggleWorking(); //off
	};
	
	// receive client model data that was saved on the server
	APIBrowser.prototype.SavedCM = function(clientmodel)
	{
		this.savedCM['serverdata'] = clientmodel;
		this.savedCMtoString('serverdata');
	};