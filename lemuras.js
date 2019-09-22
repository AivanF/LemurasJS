// AivanF LemurasJS
var lemuras=function(){var module = {};var __dirname = '';module.exports=function(modules,runtime){"use strict";var installedModules={};function __webpack_require__(moduleId){if(installedModules[moduleId]){return installedModules[moduleId].exports}var module=installedModules[moduleId]={i:moduleId,l:false,exports:{}};modules[moduleId].call(module.exports,module,module.exports,__webpack_require__);module.l=true;return module.exports}__webpack_require__.ab=__dirname+"/";function startup(){return __webpack_require__(129)}return startup()}({129:function(module,__unusedexports,__webpack_require__){var c=__webpack_require__(871);var r=__webpack_require__(760);var t=__webpack_require__(596);var u=__webpack_require__(547);var p=__webpack_require__(250);var f=__webpack_require__(445);module.exports=Object.assign({utils:u,processing:p,formula:f,F:f.create_formula},c,r,t,f)},250:function(module,__unusedexports,__webpack_require__){var m_utils=__webpack_require__(547);function mode(list){var numMapping={};var greatestFreq=0;var res;list.forEach(function findMode(value){numMapping[value]=(numMapping[value]||0)+1;if(greatestFreq<numMapping[value]){greatestFreq=numMapping[value];res=value}});return res}function percentile(list,percent){if(m_utils.is_undefined(percent)){percent=.5}list=list.slice(0);list.sort();var k=(list.length-1)*percent;var f=Math.floor(k);var c=Math.ceil(k);if(f==c){return list[f]}else{return list[f]*(c-k)+list[c]*(k-f)}}var Q1=m_utils.partial(percentile,[undefined,.25]);var Q2=m_utils.partial(percentile,[undefined,.5]);var Q3=m_utils.partial(percentile,[undefined,.75]);var median=Q2;function sum(list){var res=0;for(var i=0;i<list.length;i++){res+=list[i]}return res}function avg(list){return sum(list)/list.length}function std(list,ddof,mean){if(m_utils.is_undefined(ddof)){ddof=0}if(list.length>=1+ddof){if(m_utils.is_undefined(mean)){mean=avg(list)}var s=sum(list.map(function(x){return Math.pow(x-mean,2)}));var disp=s/(list.length-ddof);return Math.pow(disp,.5)}else{return 0}}function distinct(list){var res=[];list.forEach(function(value){if(res.indexOf(value)<0){res.push(value)}});return res}function nunique(list){return distinct(list).length}function nulls(list){var res=0;for(var i=0;i<list.length;i++){if(list[i]===null){res=list[i]}}return res}function max(list){var res=Number.NEGATIVE_INFINITY;for(var i=0;i<list.length;i++){if(list[i]>res){res=list[i]}}return res}function min(list){var res=Number.POSITIVE_INFINITY;for(var i=0;i<list.length;i++){if(list[i]<res){res=list[i]}}return res}var aggfuns={avg:avg,mean:avg,mode:mode,middle:median,median:median,q1:Q1,q2:Q2,q3:Q3,std:std,sum:sum,nunique:nunique,nulls:nulls,nones:nulls,min:min,max:max,count:function(list){return list.length},first:function(list){return list[0]},last:function(list){return list[list.length-1]},get:function(list,i){return list[i]}};function make_str(value,def){if(m_utils.is_undefined(def)){def=""}if(m_utils.is_string(value)){return value}else if(!m_utils.is_nil(value)){return value.toString()}else{return def}}function parse_int(value,def,hard){if(m_utils.is_undefined(def)){def=0}if(m_utils.is_undefined(hard)){hard=true}var res=Number(value);if(!Number.isNaN(res)){if(hard){return Math.floor(res)}else{if(Number.isInteger(res)){return res}}}return def}function parse_float(value,def){if(m_utils.is_undefined(def)){def=0}var res=Number(value);if(!Number.isNaN(res)){return res}return def}function is_none(value){return Number.isNaN(value)||m_utils.is_undefined(value)||value===null}function none_to(value,def){if(m_utils.is_undefined(def)){def=0}if(is_none(value)){return def}else{return value}}var typefuns={str:make_str,int:parse_int,float:parse_float,none_to:none_to};function lengths(value,strings_only){if(strings_only&&!m_utils.is_string(value)){return null}else{return value.toString().length}}function isin(value,other){return other.indexOf(value)>=0}var applyfuns={isnull:is_none,lengths:lengths,isin:isin,istype:function(value,type){return typeof value==type},isinstance:function(value,type){var r=value instanceof type;console.log(value,type,r);return r},is_string:m_utils.is_string,is_bool:m_utils.is_bool,is_int:m_utils.is_int,is_float:m_utils.is_float};function parse_value(value,empty){var res=parse_int(value,null,false);if(!is_none){return res}res=parse_float(value,null);if(!is_none){return res}res=value.toString().toLowerCase();if(res=="none"||res=="null"||res.length==0){return empty}return value}function parse_row(list,empty){for(var i=0;i<list.length;i++){list[i]=parse_value(list[i])}return list}module.exports={aggfuns:aggfuns,typefuns:typefuns,applyfuns:applyfuns,parse_value:parse_value,parse_row:parse_row}},445:function(module,__unusedexports,__webpack_require__){var m_utils=__webpack_require__(547);var formula_op2={"&":"band","|":"bor","^":"bxor","&&":"and","||":"or","^^":"xor","+":"add","-":"sub","*":"mul","/":"div","%":"mod","**":"pow",">":"gt","<":"lt",">=":"ge","<=":"le","==":"eq","!=":"ne","~>":"isin","<~":"findin"};var formula_op1={"!":"inv","#":"abs"};function extract_names(code){var i,last=0;var property=false;var quote_mode=null;var cur,prev=null;var names=[];function try_add(i){if(property){return}if(i>last){var name=code.slice(last,i);if(!m_utils.isLetter(name[0])){return}if(names.indexOf(name)>=0){return}if(!globalThis[name]){names.push(name)}}}for(i=0;i<code.length;i++){cur=code[i];if(quote_mode){if(cur==quote_mode&&prev!="\\"){quote_mode=null;last=i+1}}else{if(cur=='"'){quote_mode='"'}else if(cur=="'"){quote_mode="'"}else if(cur=="."){property=true}else if(cur=="_"||m_utils.isLetter(cur)){}else if(m_utils.isDigit(cur)){if(last==i-1){property=true}else{}}else{try_add(i);property=false;last=i+1}}prev=cur}try_add(i);return names}function parse_formula(code){var cur,nex,prev=null;var quote_mode=null;var op,enc_op=0;var to_close=[];var doors={};var opened_par=0;var res="";function try_close(){if(to_close.length>0&&opened_par==to_close[to_close.length-1]){if(doors[opened_par]){res+=doors[opened_par];doors[opened_par]=null}res+=")";to_close.splice(-1,1);return true}else{return false}}code+=" ";for(var i=0;i<code.length-1;i++){cur=code[i];nex=code[i+1];if(quote_mode){if(cur==quote_mode&&prev!="\\"){quote_mode=null}res+=cur}else{if(cur=='"'){quote_mode='"';res+=cur}else if(cur=="'"){quote_mode="'";res+=cur}else{op=formula_op1[cur];if(op){to_close.push(opened_par);doors[opened_par]="."+op+"("}else{op=formula_op2[cur+nex];if(!enc_op&&op){i++}else{op=formula_op2[cur]}if(!enc_op&&op){try_close();res+="."+op+"(";to_close.push(opened_par)}else if(cur=="\\"){enc_op=2}else if(cur==" "){}else{res+=cur;if(cur=="("){opened_par++}else if(cur==")"){try_close();opened_par--}}}}}if(enc_op>0){enc_op--}prev=cur}while(try_close()){}if(opened_par!=0){throw new SyntaxError("Bad parentheses count!")}res=res.replaceAll("[[",".column(");res=res.replaceAll("]]",")");return res}var formulas_cache={};function create_formula(source_code,formula_args){if(formulas_cache[source_code]){return formulas_cache[source_code]}var parsed=null;try{parsed=parse_formula(source_code);if(!formula_args){formula_args=extract_names(source_code)}var args=[null].concat(formula_args.concat(["return "+parsed+";"]));var inner=new(Function.prototype.bind.apply(Function,args));var Formula=function(){if(formula_args.length!=arguments.length){throw new Error("Formula requires {} arguments, but {} were given".format(formula_args.length,arguments.length))}return inner.apply(null,arguments)};Formula.source=source_code;Formula.parsed=parsed;Formula.args=formula_args;formulas_cache[source_code]=Formula;return Formula}catch(err){throw new SyntaxError("Got {}: {}\nParsing {}\nTo {}".format(err.name,err.message,source_code,parsed))}}module.exports={extract_names:extract_names,create_formula:create_formula}},547:function(module){function is_undefined(value){return typeof value==="undefined"}function is_nil(value){return is_undefined(value)||value===null}function is_string(value){return typeof value==="string"||value instanceof String}function is_bool(value){return!!value===value}function is_int(value){return Number.isInteger(value)}function is_float(value){return parseFloat(value)===value}function is_dict(value){return value.constructor==Object}function is_function(value){return typeof value==="function"}function isLetter(c){return c.toLowerCase()!=c.toUpperCase()}function isDigit(c){return c*0==0}function repr_cell(value,quote_strings){if(is_string(value)&&quote_strings){return'"'+value+'"'}else{return value}}function get_type(data,limit){var tp="n";var ln=0;var el,kind;for(var i=0;i<data.length;i++){if(limit&&i>limit){break}el=data[i];ln=Math.max(ln,(""+el).toString().length);if(is_bool(el)){kind="b"}else if(is_int(el)){kind="i"}else if(is_float(el)){kind="f"}else if(el instanceof Date){kind="d"}else if(is_string(el)){kind="s"}else{kind="o"}if(tp=="n"){tp=kind}else if(tp!=kind){if(tp=="f"&&kind=="i"){}else if(tp=="i"&&kind=="f"){tp="f"}else{tp="m"}}}return{type:tp,length:ln}}function partial(func,defaults){return function(){var args=[];var j=0;for(var i=0;i<defaults.length;i++){if(is_undefined(defaults[i])){args.push(arguments[j]);j++}else{args.push(defaults[i])}}return func.apply(this,args)}}String.prototype.replaceAll=function(search,replacement){return this.split(search).join(replacement)};String.prototype.format=function(){var res=this;for(var i=0;i<arguments.length;i++){res=res.replace("{"+i+"}",""+arguments[i]);res=res.replace("{}",""+arguments[i])}return res};function arrayCreate(length,def){var res=Array(length);for(var i=0;i<length;i++){res[i]=def}return res}function args2array(args){return[].slice.apply(args)}function list_of_lists(length){var res=[];for(var i=0;i<length;i++){res.push([])}return res}module.exports={is_undefined:is_undefined,is_nil:is_nil,is_string:is_string,is_int:is_int,is_float:is_float,is_dict:is_dict,is_function:is_function,isLetter:isLetter,isDigit:isDigit,repr_cell:repr_cell,get_type:get_type,partial:partial,arrayCreate:arrayCreate,args2array:args2array,list_of_lists:list_of_lists}},596:function(module,__unusedexports,__webpack_require__){var m_utils=__webpack_require__(547);var m_processing=__webpack_require__(250);var m_column=__webpack_require__(871);var m_row=__webpack_require__(760);var Table=function(columns,rows,title){if(!Array.isArray(columns)){throw TypeError("Table columns must be an array!")}if(!Array.isArray(rows)){throw TypeError("Table rows must be an array!")}this._columns=columns;this.rows=rows;this.title=title||"NoTitle";this.types=null;this._calc_columns()};Table.prototype._calc_columns=function(){this.column_indices={};for(var i=0;i<this._columns.length;i++){this.column_indices[this._columns[i]]=i}};Object.defineProperty(Table.prototype,"columns",{get:function(){return this._columns},set:function(news){if(this._columns.length!=news.length){throw Error("New columns list must have the same length!")}this._columns=news;this._calc_columns()}});Object.defineProperty(Table.prototype,"colcnt",{get:function(){return this._columns.length}});Object.defineProperty(Table.prototype,"rowcnt",{get:function(){return this.rows.length}});Table.prototype.cell=function(column,row_index){row_index=row_index||0;if(m_utils.is_string(column)){var ind=this.column_indices[column];if(m_utils.is_undefined(ind)){throw TypeError("Column {} does not exist!".format(column))}column=ind}return this.rows[row_index][column]};Table.prototype.set_cell=function(column,row_index,value){if(m_utils.is_string(column)){column=this.column_indices[column]}this.rows[row_index][column]=value};Table.prototype.column=function(column){if(m_utils.is_string(column)){if(!m_utils.is_undefined(this.column_indices[column])){column=this.column_indices[column]}}if(!m_utils.is_int(column)){throw TypeError("Column {} does not exist!".format(column))}return new m_column.Column(null,this._columns[column],this,this._columns[column])};Table.prototype.set_column=function(column,data){if(this.rowcnt!=data.length){throw Error("Table.set_column data length ({}) must be equal to table rows count ({})".format(data.length,this.rowcnt))}var ind=this.column_indices[column];if(m_utils.is_undefined(ind)){throw Error('Table.set_column "{}" does not exist!'.format(column))}if(data instanceof m_column.Column){for(var i=this.rowcnt-1;i>=0;i--){this.rows[i][ind]=data.get_value(i)}}else{for(var i=this.rowcnt-1;i>=0;i--){this.rows[i][ind]=data[i]}}this._calc_columns()};Table.prototype.add_column=function(data,title){if(!title){if(data instanceof m_column.Column){title=data.title}title="c"+this.colcnt}if(this.rowcnt==0&&this.colcnt==0){if(data instanceof m_column.Column){for(var i=data.rowcnt-1;i>=0;i--){this.rows.push([data.get_value(i)])}}else if(Array.isArray(data)){for(var i=data.length-1;i>=0;i--){this.rows.push([data[i]])}}else{throw TypeError("Table.add_column must be either an array or Column object! Got {}".format(typeof data))}}else{if(this.rowcnt!=data.length){throw Error("Table.add_column data length ({}) must be equal to table rows count ({})".format(data.length,this.rowcnt))}if(data instanceof m_column.Column){for(var i=this.rowcnt-1;i>=0;i--){this.rows[i].push(data.get_value(i))}}else if(Array.isArray(data)){for(var i=this.rowcnt-1;i>=0;i--){this.rows[i].push(data[i])}}else{throw TypeError("Table.add_column must be either an array or Column object! Got {}".format(typeof data))}}this.column_indices[title]=this.colcnt;this._columns.push(title)};Table.prototype.delete_column=function(column){var ind=m_utils.is_string(column)?this.column_indices[column]:column;this._columns.splice(ind,1);for(var i=this.rowcnt-1;i>=0;i--){this.rows[i].splice(ind,1)}this._calc_columns()};Table.prototype.rename=function(oldname,newname){if(this.column_indices[oldname]){if(oldname!=newname){this._columns[this.column_indices[oldname]]=newname;this.column_indices[newname]=this.column_indices[oldname];this.column_indices[oldname]=undefined}}};Table.from_columns=function(columns,title){var res=new Table([],[],title||"From columns");if(Array.isArray(columns)){for(var i=0;i<columns.length;i++){this.add_column(null,columns[i])}}else{for(var key in columns){this.add_column(key,columns[key])}}return res};Table.from_rows=function(rows,columns,title,preprocess){if(!columns){if(rows.length>0){columns=[];for(var i=0;i<rows[0].length;i++){columns.push("c"+i)}}else{columns=[]}}var res=new Table(columns,[],title||"From rows");for(var i=0;i<rows.length;i++){res.add_row(rows,undefined,preprocess)}return res};Table.prototype.row=function(row_index){if(!m_utils.is_int(row_index)||row_index<0||row_index>=this.rowcnt){throw new TypeError("Bad row index!")}return new m_row.Row(this,row_index)};Table.prototype.row_named=function(row_index){var res={};for(var i=0;i<this.colcnt;i++){res[this._columns[i]]=this.rows[row_index][i]}return res};Table.prototype.add_row=function(data,strict,preprocess){if(m_utils.is_undefined(strict)){strict=true}var row=[];if(data instanceof m_row.Row){if(this.colcnt!=data.colcnt){throw Error("Table.add_row Row argument must have length equal to columns count!")}for(var i=0;i<this.colcnt;i++){row.push(preprocess?m_processing.parse_value(data.get_value(i)):data.get_value(i))}}else if(Array.isArray(data)){if(this.colcnt!=data.length){throw Error("Table.add_row array argument must have length equal to columns count!")}for(var i=0;i<this.colcnt;i++){row.push(preprocess?m_processing.parse_value(data[i]):data[i])}}else{var key;for(var i=0;i<this.colcnt;i++){key=this._columns[i];if(!data[key]){if(strict){throw Error("Table.add_row dict argument does not have key "+key+"!")}else{row.push(undefined)}}else{row.push(preprocess?m_processing.parse_value(data[key]):data[key])}}}this.rows.push(row)};Table.prototype.delete_row=function(row_index){this.rows.splice(row_index,1)};Table.prototype.find_types=function(row_index){var rows=[];var key,t;for(var i=0;i<this.colcnt;i++){key=this._columns[i];t=this.column(key).get_type();rows.push([key,t.type,t.length])}this.types=new Table(["Column","Type","Symbols"],rows,"Types");return this.types};Table.prototype.append=function(other){for(var i=0;i<this.rowcnt;i++){this.add_row(other.row_named())}};Table.concat=function(tables){var res=tables[0].copy();for(var i=1;i<tables.length;i++){res.append(tables[i])}res.title="Concat";return res};Table.prototype.make_index=function(title){var res=m_column.Column.make_index(this.rowcnt);if(title){this.add_column(res,title)}return res};Table.prototype.calc=function(task,abc){var res=[];var row=new m_row.Row(this,0);var args=[row];args=args.concat(m_utils.args2array(arguments).slice(1));for(var i=0;i<this.rowcnt;i++){row.row_index=i;res.push(task.apply(null,args))}return new m_column.Column(res,"Calc")};Table.prototype.loc=function(prism,separate){if(!(prism instanceof m_column.Column)){throw TypeError("Table.loc takes one Column argument")}if(prism.length!=this.rowcnt){throw Error("Table.loc argument length must be the same")}var res=[];var checker;for(var i=0;i<this.rowcnt;i++){checker=prism.get_value(i);if(checker){if(separate){res.push(this.rows[i].slice())}else{res.push(this.rows[i])}}}var title="Filtered {}".format(this.title);var columns;if(separate){title+=" Copy";columns=this._columns}else{columns=this._columns.slice()}return new Table(columns,res,title)};function comparify(v1,v2,inv){if(inv){var tmp=v2;v2=v1;v1=tmp}if(v1<v2){return-1}else if(v1>v2){return 1}else{return 0}}Table.prototype.sort=function(columns,asc){if(!Array.isArray(columns)){columns=[columns]}if(m_utils.is_undefined(asc)){asc=false}var key,order;for(var i=columns.length-1;i>=0;i--){key=columns[i];if(m_utils.is_string(key)){key=this.column_indices[key]}if(Array.isArray(asc)){order=asc[i]}else{order=asc}this.rows.sort(function(row1,row2){return comparify(row1[key],row2[key],!order)})}};Table.prototype.forEach=function(callback){var row=new m_row.Row(this,0);for(var i=0;i<this.rowcnt;i++){row.row_index=i;callback(row,i)}};Table.prototype.copy=function(){var columns=this._columns.slice();var rows=[];for(var i=0;i<this.rowcnt;i++){rows.push(this.rows[i].slice())}return new Table(columns,rows,this.title)};Table.prototype.groupby=function(key_columns){if(!key_columns){key_columns=[]}if(!Array.isArray(key_columns)){key_columns=[key_columns]}for(var i=0;i<key_columns.length;i++){if(m_utils.is_undefined(this.column_indices[key_columns[i]])){throw Error('GroupBy arg "{}" is not a Table column name!'.format(key_columns[i]))}}var m_grouped=__webpack_require__(789);var res=new m_grouped.Grouped(key_columns,this._columns,this.column_indices,this.title);this.forEach(function(row){res.add(row)});return res};module.exports={Table:Table}},760:function(module,__unusedexports,__webpack_require__){var m_utils=__webpack_require__(547);var m_processing=__webpack_require__(250);var Row=function(table,row_index,values,columns){if(!values){if(!table||m_utils.is_nil(row_index)){throw Error("Both table and row_index must be set!")}}else{if(table){throw Error("Either values or table must be not None!")}if(!columns){columns=[];for(var i=0;i<values.length;i++){columns.push("c"+i)}}}this.table=table;this.row_index=row_index;this.values=values;this.column_names=columns};Object.defineProperty(Row.prototype,"colcnt",{get:function(){if(this.values){return this.values.length}else{return this.table.colcnt}}});Object.defineProperty(Row.prototype,"length",{get:function(){return this.colcnt}});Object.defineProperty(Row.prototype,"columns",{get:function(){if(this.values){return this.column_names}else{return this.table.columns}}});Row.prototype.get_values=function(){if(this.values){return this.values}else{var res=[];for(var i=0;i<this.table.colcnt;i++){res.push(this.table.rows[this.row_index][i])}return res}};Row.prototype.get_value=function(column){if(this.values){if(m_utils.is_string(column)){var ind=this.column_names.indexOf(column);if(ind<0){throw TypeError("Column {} does not exist!".format(column))}column=ind}return this.values[column]}else{return this.table.cell(column,this.row_index)}};Row.prototype.set_value=function(column,value){if(this.values){if(m_utils.is_string(column)){this.values[this.column_names.indexOf(column)]=value}else{this.values[column]=value}}else{this.table.set_cell(column,this.row_index,value)}};Row.prototype.get_type=function(column,value){return m_utils.get_type(this.get_values())};Row.prototype.calc=function(task,abc){if(m_utils.is_string(task)){if(m_processing.aggfuns[task]){task=m_processing.aggfuns[task]}else{throw Error('Applied function named "{}" does not exist!'.format(task))}}var args=[this.get_values()];args=args.concat(m_utils.args2array(arguments).slice(1));return task.apply(null,args)};Row.prototype.forEach=function(callback){for(var i=0;i<this.colcnt;i++){callback(this.get_value(i),i,this.columns[i])}};Row.prototype.copy=function(){return new Row(null,null,this.get_values(),this.columns)};Row.prototype.toString=function(){var values=this.get_values().map(m_utils.partial(m_utils.repr_cell,[undefined,true]));var res;if(!this.values){res='- Row {} of table "{}"'.format(this.row_index,this.table.title)}else{res="- Row independent"}res+="\n"+values.join(", ");return res};module.exports={Row:Row}},789:function(module,__unusedexports,__webpack_require__){var m_utils=__webpack_require__(547);var m_processing=__webpack_require__(250);var m_table=__webpack_require__(596);var Grouped=function(key_columns,source_columns,source_column_indices,source_name){if(!m_utils.is_string(source_name)){throw new TypeError('Grouped source_name must be a string, but "{}" given'.format(source_name))}this.source_name=source_name;this.keys=key_columns;this.key_count=key_columns.length;this.fun=null;this.ownkey2srckey=[];for(var i=0;i<key_columns.length;i++){this.ownkey2srckey.push(source_column_indices[key_columns[i]])}this.agg_column2ind={};this.src_column_is_agg=[];var step=0;for(var i=0;i<source_columns.length;i++){if(key_columns.indexOf(source_columns[i])<0){this.src_column_is_agg.push(true);this.agg_column2ind[source_columns[i]]=step;step++}else{this.src_column_is_agg.push(false)}}if(this.key_count>0){this.values={}}else{this.values=m_utils.list_of_lists(Object.keys(this.agg_column2ind).length)}this.source_values={}};Grouped.prototype.add=function(row){var vals=this.values;for(var i=0;i<this.key_count;i++){var last=i==this.key_count-1;var ind=this.ownkey2srckey[i];var cur=row.get_value(ind);this.source_values[i]=this.source_values[i]||{};this.source_values[i][cur]=cur;if(!vals[cur]){if(last){vals[cur]=m_utils.list_of_lists(Object.keys(this.agg_column2ind).length)}else{vals[cur]={}}}vals=vals[cur]}var step=0;for(var i=0;i<row.length;i++){if(this.src_column_is_agg[i]){vals[step].push(row.get_value(i));step++}}};Grouped.prototype._agglist=function(keys,cols){var res=keys;for(var target_name in this.fun){var cur_col=cols[this.agg_column2ind[target_name]];for(var new_name in this.fun[target_name]){var task=this.fun[target_name][new_name];var got;if(m_utils.is_string(task)){if(m_processing.aggfuns[task]){got=m_processing.aggfuns[task](cur_col)}else{throw new Error('Aggregation function "{}" does not exist!'.format(task))}}else{if(m_utils.is_function(task)){got=task(cur_col)}else{throw new TypeError("Aggregation function must be a function!")}}if(m_utils.is_undefined(got)){throw new Error("Aggregation function returned undefined!")}res.push(got)}}return res};Grouped.prototype._recurs=function(task,vals,keys,ind){vals=vals||this.values;keys=keys||[];ind=ind||0;var res=[];var new_keys;if(Array.isArray(vals)){var v=task(keys,vals);if(!m_utils.is_undefined(v)){res.push(v)}}else{for(var key in vals){new_keys=[].concat(keys).concat([this.source_values[ind][key]]);res=res.concat(this._recurs(task,vals[key],new_keys,ind+1))}}return res};Grouped.prototype.agg=function(fun,default_fun){if(default_fun){for(var target_name in this.agg_column2ind){if(!fun[target_name]){fun[target_name]={}}if(m_utils.is_dict(default_fun)){for(var key in default_fun){fun[target_name]["{}_{}".format(target_name,key)]=default_fun[key]}}else if(Array.isArray(default_fun)){default_fun.forEach(function(task){if(!m_utils.is_string(task)){throw new TypeError("Default functions in an array must be string names!")}fun[target_name]["{}_{}".format(target_name,task)]=task})}else{fun[target_name][target_name]=default_fun}}}for(var target_name in fun){if(m_utils.is_undefined(this.agg_column2ind[target_name])){throw new Error('Cannot aggregate key column "{}"'.format(target_name))}if(!m_utils.is_dict(fun[target_name])){var tmp={};tmp[target_name]=fun[target_name];fun[target_name]=tmp}}this.fun=fun;var cols=this.keys.slice();for(var target_name in fun){for(var new_name in fun[target_name]){cols.push(new_name)}}var self=this;var rows=this._recurs(function(keys,vals){return self._agglist(keys,vals)});return new m_table.Table(cols,rows,"Aggregated "+this.source_name)};Grouped.prototype._make_group=function(keys,cols,add_keys,pairs){var t="Group";var ids={};for(var i=0;i<this.keys.length;i++){t+=" {}={}".format(this.keys[i],keys[i]);if(pairs){ids[this.keys[i]]=keys[i]}}var res=new m_table.Table([],[],t);if(add_keys){for(var i=0;i<this.keys.length;i++){res.add_column(m_utils.arrayCreate(cols[0].length,keys[i]),this.keys[i])}}for(var el in this.agg_column2ind){res.add_column(cols[this.agg_column2ind[el]],el)}if(pairs){return[ids,res]}else{return res}};Grouped.prototype.split=function(add_keys,pairs){var self=this;return this._recurs(function(keys,cols){return self._make_group(keys,cols,add_keys,pairs)})};Grouped.prototype.get_group=function(search_keys,add_keys){if(m_utils.is_undefined(add_keys)){add_keys=true}if(!Array.isArray(search_keys)){search_keys=[search_keys]}var self=this;function find_table(keys,cols){var matched=true;for(var i=0;i<keys.length;i++){if(keys[i]!=search_keys[i]){matched=false;break}}if(matched){return self._make_group(keys,cols,add_keys,false)}}return this._recurs(find_table)[0]};Grouped.prototype.counts=function(){var rows=[];function task(keys,cols){rows.push([].concat(keys).concat([cols[0].length]))}this._recurs(task);return new m_table.Table([].concat(this.keys).concat(["rows"]),rows,"Groups")};Grouped.prototype.toString=function(){return'- Grouped object "{}", keys: [{}], old columns: [{}].'.format(this.source_name,this.keys,Object.keys(this.agg_column2ind))};module.exports={Grouped:Grouped}},871:function(module,__unusedexports,__webpack_require__){var m_utils=__webpack_require__(547);var m_processing=__webpack_require__(250);var Column=function(values,title,table,source_name){this.title=title||"NoName";if(!values&&!table){throw TypeError("Either values or table must be not null!")}if(values&&table){throw TypeError("Either values or table must be given, not both of them!")}if(table&&!source_name){throw TypeError("Column linking requires source_name argument!")}if(values){if(!Array.isArray(values)){throw TypeError("Column values must be an array!")}}this.values=values;this.table=table;this.source_name=source_name};Column.prototype.get_values=function(){if(this.values){return this.values}else{var column_index=this.table.column_indices[this.source_name];var res=[];return this.table.rows.map(function(row){return row[column_index]})}};Column.prototype.get_value=function(row_index){if(this.values){return this.values[row_index]}else{var column_index=this.table.column_indices[this.source_name];return this.table.rows[row_index][column_index]}};Column.prototype.set_value=function(row_index,value){if(this.values){this.values[row_index]=value}else{var column_index=this.table.column_indices[this.source_name];this.table.rows[row_index][column_index]=value}};Column.make=function(length,value,title){var values=[];for(var i=0;i<length;i++){values.push(value)}return Column(values,title)};Column.make_index=function(length,title){var values=[];for(var i=0;i<length;i++){values.push(i)}return new Column(values,title)};Column.prototype.get_type=function(){var limit=this.rowcnt;if(limit>4096){limit=Math.floor(limit/3)}else if(limit>2048){limit=Math.floor(limit/2)}return m_utils.get_type(this.get_values(),limit)};Column.prototype.folds=function(fold_count,start){throw Error("Not implemented!")};Column.prototype.apply=function(task,defaults){if(m_utils.is_string(task)){if(m_processing.typefuns[task]){task=m_processing.typefuns[task]}else if(m_processing.applyfuns[task]){task=m_processing.applyfuns[task]}else{throw Error('Applied function named "'+task+'" does not exist!')}}var defaults=m_utils.args2array(arguments).slice(1);for(var i=0;i<this.rowcnt;i++){args=[this.get_value(i)].concat(defaults);this.set_value(i,task.apply(null,args))}return this};Column.prototype.calc=function(task,defaults){if(m_utils.is_string(task)){if(m_processing.aggfuns[task]){task=m_processing.aggfuns[task]}else{throw Error('Applied function named "'+task+'" does not exist!')}}var args=[this.get_values()];args=args.concat(m_utils.args2array(arguments).slice(1));return task.apply(null,args)};Column.prototype.loc=function(prism){var res=[];if(prism instanceof Column){if(this.rowcnt==prism.rowcnt){for(var i=0;i<this.rowcnt;i++){if(prism.get_value(i)){res.push(this.get_value(i))}}}else{throw Error("Loc arument array must have the same length!")}}else if(Array.isArray(prism)){if(this.rowcnt==prism.length){for(var i=0;i<this.rowcnt;i++){if(prism[i]){res.push(this.get_value(i))}}}else{throw Error("Loc arument array must have the same length!")}}else{throw TypeError("Loc argument must be an array or a Column!")}var title="Filtered "+this.title;return new Column(res,title)};Column.prototype.forEach=function(callback){for(var i=0;i<this.rowcnt;i++){callback(this.get_value(i),i)}};Column.prototype.copy=function(task,defaults){return new Column(this.get_values(),this.title)};Column.prototype.toString=function(){var n=self.rowcnt;var ns=false;if(n>12){n=10;ns=true}var values=this.get_values().slice(0,n).map(m_utils.partial(m_utils.repr_cell,[undefined,true]));var res;if(!this.values){res='- Column "{}" of table "{}", '.format(this.title,this.table.title)}else{res='- Column "{}", '.format(this.title)}res+=this.rowcnt+" values\n"+values.join(", ");if(ns){res+=" . ."}return res};Object.defineProperty(Column.prototype,"rowcnt",{get:function(){if(this.values){return this.values.length}else{return this.table.rowcnt}}});Object.defineProperty(Column.prototype,"length",{get:function(){if(this.values){return this.values.length}else{return this.table.rowcnt}}});Column.prototype.indexOf=function(value){return this.get_values().indexOf(value)};Column.prototype.isin=function(other){var values=[];for(var i=0;i<this.rowcnt;i++){values.push(other.indexOf(this.get_value(i))>=0)}return new Column(values)};Column.prototype.findin=function(other){var values=[];for(var i=0;i<this.rowcnt;i++){values.push(other.indexOf(this.get_value(i)))}return new Column(values)};Column.prototype._op1=function(func){var values=[];for(var i=0;i<this.rowcnt;i++){values.push(func(this.get_value(i)))}return new Column(values)};Column.prototype._op2=function(other,func){var values=[];if(other instanceof Column){if(this.rowcnt!=other.rowcnt){throw Error("Operation argument column has wrong length {}, but column has {}".format(other.length,this.rowcnt))}for(var i=0;i<this.rowcnt;i++){values.push(func(this.get_value(i),other.get_value(i)))}}else if(Array.isArray(other)){if(this.rowcnt!=other.length){throw Error("Operation argument array has wrong length {}, but column has {}".format(other.length,this.rowcnt))}for(var i=0;i<this.rowcnt;i++){values.push(func(this.get_value(i),other[i]))}}else{for(var i=0;i<this.rowcnt;i++){values.push(func(this.get_value(i),other))}}return new Column(values)};Column.prototype.inv=function(){return this._op1(function(value){return!value})};Column.prototype.abs=function(){return this._op1(function(value){return Math.abs(value)})};Column.prototype.band=function(other){return this._op2(other,function(a,b){return a&b})};Column.prototype.bor=function(other){return this._op2(other,function(a,b){return a|b})};Column.prototype.bxor=function(other){return this._op2(other,function(a,b){return a^b})};Column.prototype.and=function(other){return this._op2(other,function(a,b){return a&&b})};Column.prototype.or=function(other){return this._op2(other,function(a,b){return a||b})};Column.prototype.xor=function(other){return this._op2(other,function(a,b){return!a!=!b})};Column.prototype.add=function(other){return this._op2(other,function(a,b){return a+b})};Column.prototype.sub=function(other){return this._op2(other,function(a,b){return a-b})};Column.prototype.mul=function(other){return this._op2(other,function(a,b){return a*b})};Column.prototype.div=function(other){return this._op2(other,function(a,b){return a/b})};Column.prototype.mod=function(other){return this._op2(other,function(a,b){return a%b})};Column.prototype.pow=function(other){return this._op2(other,function(a,b){return Math.pow(a,b)})};Column.prototype.gt=function(other){return this._op2(other,function(a,b){return a>b})};Column.prototype.lt=function(other){return this._op2(other,function(a,b){return a<b})};Column.prototype.ge=function(other){return this._op2(other,function(a,b){return a>=b})};Column.prototype.le=function(other){return this._op2(other,function(a,b){return a<=b})};Column.prototype.eq=function(other){return this._op2(other,function(a,b){return a==b})};Column.prototype.ne=function(other){return this._op2(other,function(a,b){return a!=b})};module.exports={Column:Column}}});
return module.exports;}();