Function.prototype.child = function()
{
    function Class()
    {
    	if (!(this instanceof Class))
            throw('Constructor called without "new"');
		if ('SETID' in this)
			this.SETID.apply(this, arguments);
        if ('__init__' in this)
            this.__init__.apply(this, arguments);
    }
    Function.prototype.child.nonconstructor.prototype = this.prototype;
    Class.prototype = new Function.prototype.child.nonconstructor();
    return Class;
};
Function.prototype.child.nonconstructor= function() {};

WSClient = Object.child();
	WSClient.prototype.__init__ = function(symbols)
	{
		this.channel = new WSConnection('{SERVER_ADDRESS}',8000,true);
		this.symbols = def(symbols, []);
		this.symbols.push.apply(this.symbols, ['onOpen','onClose','onError']);
		var n;
		for (n = 0; n < this.symbols.length; n++)
		{
			this.channel.register(this, this.symbols[n]);
		}
		this.channel.connect();
	};
	
	// automatically called when extending
	WSClient.prototype.SETID = function()
	{
		this.cid = '{CLIENTID}';
	};
	
	// OVERRIDE THIS IN CHILD
	WSClient.prototype.onOpen = function(){};
		
	// OVERRIDE THIS IN CHILD
	WSClient.prototype.onClose = function(){};
	
	// display server error // Overwrite this in child if necessary
	WSClient.prototype.onError = function(errorMsg)
	{
		this.channel.log(errorMsg);
	};
	
	// send a command to the server
	WSClient.prototype.send = function(cmd, msg)
	{
		msg = msg || false;
		if (this.isChannelOpen())
		{
			if (msg)
			{
				this.channel.send(this.cid, cmd, msg);
			}
			else
			{
				this.channel.send(this.cid, cmd, '');
			}
		}
		else
		{
			this.channel.log('Error: Cannot send message, connection is closed');
		}
	};
	
	// get connection status
	WSClient.prototype.isChannelOpen = function()
	{
		return (this.channel && this.channel.ws.readyState == WebSocket.OPEN);
	};

WSConnection = Object.child();
	WSConnection.prototype.__init__ = function(host, port, verbose)
	{
		this.full_address = host+((port)?":"+port:"");
		this.cid = 'WebSocket';
		this.verbose = verbose;
		this.triggers = [];
	};
	
	// print a message in console with a time sig
	WSConnection.prototype.log = function(msg)
	{
		if (this.verbose)
		{
			var t = new Date();
			console.log('['+t.getHours()+':'+t.getMinutes()+':'+t.getSeconds()+':'+t.getMilliseconds()+'] '+msg);
		}
	};
	
	// establish a connection and register handlers
	WSConnection.prototype.connect = function()
	{
		this.log("Connecting to " + this.full_address);
		this.ws = new WebSocket("ws://"+this.full_address);
		var mirror = this;
		this.ws.onopen = function(i)
		{
			mirror.log("Connection open to " + mirror.full_address);
			mirror.fire('{CLIENTID}', 'onOpen');
		};
		this.ws.onclose = function(i)
		{
			mirror.log("Disconnected from " + mirror.full_address);
			mirror.fire('{CLIENTID}', 'onClose');
		};
		this.ws.onerror = function(e)
		{
			mirror.fire(mirror.cid, 'onError', 'Connection error: ' + e.data);
		};
		this.ws.onmessage = function(msg)
		{
			msg = new InMsg(msg);
			if (msg.valid)
			{
				mirror.log("<<< Received message; CID: " + msg.cid + ", Command: "+msg.cmd+", Length: "+msg.length);
				mirror.fire(msg.cid, msg.cmd, msg.data);
			}
			else
				mirror.fire(mirror.cid, 'onError', 'Invalid server command: ' + msg.data);
			
			// TODO think about what to do with the message post-process. statistics?
		};
	};
	
	// create a callback mapping to some object's methods
	WSConnection.prototype.getCallback = function(context, name)
	{
        return function()
        {
            var args = Array.prototype.slice.call(arguments);
            args.shift();
			if (args.length > 1)
			{
				context[name].apply(context, [args]);
			}
			else
			{
				context[name].apply(context, args);
			}
        };
    };
	
	// register a callback under global trigger name
    WSConnection.prototype.register = function(context, name)
    {
    	if (name in context)
    	{
			var trigger = 'ws_' + context.cid + '_' +name;
			this.log('Register '+trigger);
			this.triggers.push(trigger);
			$(document).bind('ws_' + context.cid + '_' +name, this.getCallback(context, name));
		}
		else
		{
			this.log('Member '+name+' not found');
		}
    };
    
    // activate a callback with a trigger
    WSConnection.prototype.fire = function(cid, trigname, args)
    {
    	var trigger = 'ws_' + cid + "_" + trigname;
    	if (jQuery.inArray(trigger, this.triggers) > -1)
    	{
			this.log('Trigger ' + trigger);
			$(document).trigger(trigger, args);
		}
		else
		{
			this.log('Trigger '+trigger+' not found');
		}
    };
	
	// send data through the socket
	WSConnection.prototype.send = function(cid, cmd, data)
	{
		var msg = new OutMsg(cid, cmd, data);
		this.log(">>> Sending message; CID: " + msg.cid + ", Command: "+msg.cmd+", Length: "+msg.length);
		this.ws.send(msg.toString());
	};
	
	// close the connection
	WSConnection.prototype.disconnect = function()
	{
		this.ws.close();
	};

Msg = Object.child();
	Msg.prototype.__init__ = function(json)
	{
		if ('cid' in json && 'cmd' in json && 'data' in json)
		{
			this.cid = json.cid;
			this.cmd = json.cmd;
			this.data = json.data;
			this.valid = true;
		}
		else
			this.valid = false;
	};
	Msg.prototype.toJSON = function()
	{
		return {
			"cid":this.cid,
			"cmd":this.cmd,
			"data":this.data
			};
	};
	Msg.prototype.toString = function()
	{
		return JSON.stringify(this.toJSON());
	};

InMsg = Msg.child();
	InMsg.prototype.__init__ = function(msg)
	{
		json = jQuery.parseJSON(msg.data);
		this.length = msg.data.length;
		Msg.prototype.__init__.call(this, json);
	};
	
OutMsg = Msg.child();
	OutMsg.prototype.__init__ = function(cid, cmd, data)
	{
		Msg.prototype.__init__.call(this, {
			"cid":cid,
			"cmd":cmd,
			"data":data
			});
		this.length = this.toString().length;
	};