BSTable = WSClient.child();
	// constructor, set initial values and initiate connection
	BSTable.prototype.__init__ = function()
	{
		this.fields = {};
		this.columns = ["rla","low","buy","sel"];
		this.precision = parseInt($('#precision').val());
		var mirror = this;
		$('#tbl tr').children().each(function(i){mirror.loadField(this)});
		$('#precision').change(function(e){mirror.changePrecision()});
		$('#disconnect').click(this.pauseAndQuit);
		
		WSClient.prototype.__init__.call(this, ['loadJSON']);
	};
	
	// start the data stream upon opening the connection
	BSTable.prototype.onOpen = function()
	{
		this.send('status','start');
	};
	
	// when quitting, tell the server to pause the data stream and disconnect
	BSTable.prototype.pauseAndQuit = function()
	{
		this.send('status','pause');
		this.channel.disconnect();
	};
	
    // load a fields value to the object
    BSTable.prototype.loadField = function(fieldElement)
    {
        var id = $(fieldElement).attr('id');
        if (!(id in this.fields))
        {
            this.fields[id] = new Field(id);
        }
        this.fields[id].setValue($(fieldElement).text(), this.precision);
    };
    
    // toggle between long and short numbers
    BSTable.prototype.changePrecision = function()
    {
        this.precision = parseInt($('#precision').val());
        for (f in this.fields)
        {
            this.fields[f].setValue(this.fields[f].value, this.precision);
            this.fields[f].stretch(this.precision);
        }
    };
    
    // load all values from JSON data
    BSTable.prototype.loadJSON = function(jsonMsg)
    {
        var rat_lo = Number.POSITIVE_INFINITY;
        var rat_hi = Number.NEGATIVE_INFINITY;
        for (row in jsonMsg)
        {
            if (row != 'request_time')
            {
                for (var i=0; i<this.columns.length; i++)
                {
                    var field = this.fields['tbl_' + row + '_' + this.columns[i]];
					var newValue = parseFloat(jsonMsg[row][i]);
					if (newValue > field.value)
					{
						var change = 'up';
					}
					else if (newValue < field.value)
					{
						var change = 'down';
					}
					else
					{
						var change = 'none';
					}
                    field.setValue(newValue, this.precision, change);
                    if (row.slice(4) == 'rat' || row.length == 3)
                    {
                        if (field.value < rat_lo)
                            rat_lo = field.mark('lo');
                        else if (field.value > rat_hi)
                            rat_hi = field.mark('hi');
                    }
                }
            }
        }
    };

Field = Object.child();
	Field.prototype.__init__ = function(id)
	{
		this.element = $('#' + id);
		this.id = id;
		this.change = 'blank';
		this.baseWidth = this.element.width();
	};

	// change fields value and indicate change
    Field.prototype.setValue = function(value, precision, change)
    {
    	this.change = def(change, this.change);
        this.value = value;
        if (typeof value == 'string')
            this.element.html(value);
        else
            this.element.html(value.toFixed(precision) + ' <img src="img/change_'+this.change+'.gif" id="img_'+this.id+'" />');
    };
    
    // resize the cell to fit a new sized number
    Field.prototype.stretch = function(precision)
    {
    	this.element.width(this.baseWidth + 5 * precision);
    };
    
	// mark as lowest or highest rate
    Field.prototype.mark = function(lohi)
    {
        $('#tbl tr').children().removeClass("rat_" + lohi);
        this.element.addClass("rat_" + lohi);
        return this.value;
    };