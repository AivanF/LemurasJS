// AivanF LemurasJS
var lemuras=function(){var module = {};var __dirname = '';module.exports=function(modules,runtime){"use strict";var installedModules={};function __webpack_require__(moduleId){if(installedModules[moduleId]){return installedModules[moduleId].exports}var module=installedModules[moduleId]={i:moduleId,l:false,exports:{}};modules[moduleId].call(module.exports,module,module.exports,__webpack_require__);module.l=true;return module.exports}__webpack_require__.ab=__dirname+"/";function startup(){return __webpack_require__(129)}return startup()}({129:function(module,__unusedexports,__webpack_require__){module.exports=Object.assign({},__webpack_require__(871),__webpack_require__(596))},250:function(module,__unusedexports,__webpack_require__){var m_utils=__webpack_require__(547);function mode(list){throw"Not implemented!"}function percentile(list,percent){if(m_utils.is_undefined(percent)){percent=.5}list=list.slice(0);var k=(list.length-1)*percent;var f=Math.floor(k);var c=Math.ceil(k);if(f==c){return list[f]}else{return list[f]*(c-k)+list[c]*(k-f)}}var Q1=m_utils.partial(percentile,[undefined,.25]);var Q2=m_utils.partial(percentile,[undefined,.5]);var Q3=m_utils.partial(percentile,[undefined,.75]);var median=Q2;function sum(list){var res=0;for(var i=0;i<list.length;i++){res+=list[i]}return res}function avg(list){return sum(list)/list.length}function std(list,ddof,mean){if(list.length>=1+ddof){if(m_utils.is_undefined(mean)){mean=avg(list)}var s=sum(list.map(function(x){return Math.power(x-mean,2)}));var disp=s/(list.length-ddof);return Math.power(disp,.5)}else{return 0}}function distinct(list){var res=[];list.forEach(function(value){if(list.indexOf(value)<0){res.push(value)}});return res}function nunique(list){return distinct(list).length}function nulls(list){var res=0;list.forEach(function(value){if(value===null){res+=1}});return res}function max(list){var res=Number.NEGATIVE_INFINITY;list.forEach(function(value){if(value>res){res=value}});return res}function min(list){var res=Number.POSITIVE_INFINITY;list.forEach(function(value){if(value>res){res=value}});return res}var aggfuns={avg:avg,mean:avg,mode:mode,middle:median,median:median,q1:Q1,q2:Q2,q3:Q3,std:std,sum:sum,nunique:nunique,nulls:nulls,nones:nulls,min:min,max:max,count:function(list){return list.length},first:function(list){return list[0]},last:function(list){return list[list.length-1]},get:function(list,i){return list[i]}};function make_str(value,def){if(m_utils.is_string(value)){return value}else if(m_utils.is_undefined(def)){return value.toString()}else{return def}}function parse_int(value,def,hard){if(m_utils.is_undefined(def)){def=0}if(m_utils.is_undefined(hard)){hard=true}var res=Number(value);if(!Number.isNaN(res)){if(hard){return Math.floor(res)}else{if(Number.isInteger(res)){return res}}}return def}function parse_float(value,def){if(m_utils.is_undefined(def)){def=0}var res=Number(value);if(!Number.isNaN(res)){return res}return def}function is_none(value){return Number.isNaN(value)||m_utils.is_undefined(value)||value===null}function none_to(value,def){if(m_utils.is_undefined(def)){def=0}if(is_none(value)){return def}else{return value}}var typefuns={str:make_str,int:parse_int,float:parse_float,none_to:none_to};function lengths(value,strings_only){if(strings_only&&!m_utils.is_string(value)){return null}else{return value.toString().length}}function isin(value,other){return other.indexOf(value)>=0}var applyfuns={isnull:is_none,lengths:lengths,isin:isin};function parse_value(value,empty){var res=parse_int(value,null,false);if(!is_none){return res}var res=parse_float(value,null);if(!is_none){return res}res=value.toString().toLowerCase();if(res=="none"||res=="null"||res.length==0){return empty}return value}function parse_row(list,empty){for(var i=0;i<list.length;i++){list[i]=parse_value(list[i])}return list}module.exports={aggfuns:aggfuns,typefuns:typefuns,applyfuns:applyfuns,parse_value:parse_value,parse_row:parse_row}},547:function(module){function is_undefined(value){return typeof value==="undefined"}function is_string(value){return typeof value==="string"||value instanceof String}function is_int(value){return Number.isInteger(value)}function is_float(value){return parseFloat(value)===value}function get_type(data,limit){var tp="n";var ln=0;var el,kind;for(var i=0;i<data.length;i++){if(limit&&i>limit){break}el=data[i];ln=Math.max(ln,(""+el).toString().length);if(is_int(el)){kind="i"}else if(is_float(el)){kind="f"}else if(el instanceof Date){kind="d"}else if(is_string(el)){kind="s"}else{kind="o"}if(tp=="n"){tp=kind}else if(tp!=kind){if(tp=="f"&&kind=="i"){}else if(tp=="i"&&kind=="f"){tp="f"}else{tp="m"}}}return{type:tp,length:ln}}function partial(func,defaults){return function(){var args=[];var j=0;for(var i=0;i<defaults.length;i++){if(is_undefined(defaults[i])){args.push(arguments[j]);j++}else{args.push(defaults[i])}}return func.apply(this,args)}}module.exports={is_undefined:is_undefined,is_string:is_string,is_int:is_int,is_float:is_float,get_type:get_type,partial:partial}},596:function(module,__unusedexports,__webpack_require__){var m_utils=__webpack_require__(547);var m_column=__webpack_require__(871);var Table=function(columns,rows,title){this._columns=columns;this.rows=rows;this.title=title||"NoTitle";this.types=null;this._calc_columns()};Table.prototype._calc_columns=function(){this.column_indices={};for(var i=0;i<this._columns.length;i++){this.column_indices[this._columns[i]]=i}};Object.defineProperty(Table.prototype,"columns",{get:function(){return this._columns},set:function(news){if(this._columns.length!=news.length){throw"New columns list must have the same length!"}this._columns=news;this._calc_columns()}});Object.defineProperty(Table.prototype,"colcnt",{get:function(){return this._columns.length}});Object.defineProperty(Table.prototype,"rowcnt",{get:function(){return this.rows.length}});Table.prototype.cell=function(column,row_index){if(m_utils.is_string(column)){column=this.column_indices[column]}return this.rows[row_index][column]};Table.prototype.set_cell=function(column,row_index,value){if(m_utils.is_string(column)){column=this.column_indices[column]}this.rows[row_index][column]=value};Table.prototype.column=function(column){if(m_utils.is_string(column)){column=this.column_indices[column]}else if(!m_utils.is_int(column)){throw"Bad column key "+column}return new m_column.Column(null,this._columns[column],this,this._columns[column])};module.exports={Table:Table}},871:function(module,__unusedexports,__webpack_require__){var m_utils=__webpack_require__(547);var m_processing=__webpack_require__(250);var Column=function(values,title,table,source_name){this.title=title||"NoName";if(!values&&!table){throw"Either values or table must be not null!"}if(values&&table){throw"Either values or table must be given, not both of them!"}if(table&&!source_name){throw"Table requres source_name argument!"}this.values=values;this.table=table;this.source_name=source_name};Column.prototype.get_values=function(){if(this.values){return this.values}else{var column_index=this.table.column_indices[this.source_name];var res=[];return this.table.rows.map(function(row){return row[column_index]})}};Column.prototype.get_value=function(row_index){if(this.values){return this.values[row_index]}else{var column_index=this.table.column_indices[this.source_name];return this.table.rows[row_index][column_index]}};Column.prototype.set_value=function(row_index,value){if(this.values){this.values[row_index]=value}else{var column_index=this.table.column_indices[this.source_name];this.table.rows[row_index][column_index]=value}};Column.prototype.forEach=function(callback){for(var i=0;i<this.rowcnt;i++){callback(this.get_value(i),i)}};Column.make=function(length,value,title){var values=[];for(var i=0;i<length;i++){values.push(value)}return Column(values,title)};Column.make_index=function(length,title){var values=[];for(var i=0;i<length;i++){values.push(i)}return new Column(values,title)};Column.prototype.get_type=function(){var limit=this.rowcnt;if(limit>4096){limit=Math.floor(limit/3)}else if(limit>2048){limit=Math.floor(limit/2)}return m_utils.get_type(this.get_values(),limit)};Column.prototype.folds=function(fold_count,start){throw"Not implemented!"};Column.prototype.apply=function(task,defaults,separate){if(m_utils.is_string(task)){if(m_processing.typefuns[task]){task=m_processing.typefuns[task];if(m_utils.is_undefined(separate)){separate=false}}else if(m_processing.applyfuns[task]){task=m_processing.applyfuns[task];if(m_utils.is_undefined(separate)){separate=true}}else{throw'Applied function named "'+task+'" does not exist!'}}else{if(m_utils.is_undefined(separate)){separate=false}}if(!m_utils.is_undefined(defaults)){task=m_utils.partial(task,defaults)}if(separate){var res=[];for(var i=0;i<this.rowcnt;i++){res.push(task(this.get_value(i)))}return new Column(res,this.title)}else{for(var i=0;i<this.rowcnt;i++){this.set_value(i,task(this.get_value(i)))}return this}};Object.defineProperty(Column.prototype,"rowcnt",{get:function(){if(this.values){return this.values.length}else{return this.table.rowcnt}}});Object.defineProperty(Column.prototype,"length",{get:function(){if(this.values){return this.values.length}else{return this.table.rowcnt}}});module.exports={Column:Column}}});
return module.exports;}();