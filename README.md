# LemurasJS  ![status](https://img.shields.io/badge/status-dev-yellow.svg?style=flat)

A small library to deal with tables written in pure JavaScript! It is not intended to be super fast, but it is capable of all the popular tables stuff: rows/columns manipulations, tables concatenating, joining, grouping, formats converting. ECMAScript version: `5.1`.

This is a JS version of [Lemuras library](https://github.com/AivanF/Lemuras) (for Python). Most of the API is the same, but some function arguments are removed/added.

Also, unfortunately, ES5 doesn't support operators overriding which is really handy for columns manipulations, e.g:  
`!tbl1['col1'] * tbl1['col2'] + tbl2['col1']`  
Instead, raw functional way can be used, e.g:  
`tbl1.column('col1').inv().mul(tbl1.column('col2').add(tbl2.column('col1'))`  
However, special Formula class is created that can dynamically convert notations like first, infix one to the notations like second, functional one.

<details>
  <summary>More examples</summary>
 Formula can convert that:
 
  ```javascript
  ( (tbl[["id"]]+tbl[["value"]]) -3 *(5\*20) ).apply("int") %10 >2
  ```
 To this:

  ```javascript
  ((tbl.column("id").add(tbl.column("value"))).sub(3).mul((5*20))).apply("int").mod(10).gt(2)
  ```
</details>

The library is under development now. Currently, you can see all the examples in [tests folder](https://github.com/AivanF/LemurasJS/tree/master/__tests__) and [index.html](https://github.com/AivanF/LemurasJS/blob/master/index.html).

## ToDos

✅ Table class basic mechanics  
✅ Column class  
✅ Row class  
✅ Date class support  
✅ Table.find(_all)  
✅ Table.groupby  
✅ Table.pivot  
✅ Table.merge  
✅ Table.to/from SQL  
❌ Table.to/from CSV  
❌ Table.to/from JSON  
❌ Table.to/from HTML  
❌ Imporve & test Formula  
❌ Write examples  

## License

 This software is provided 'as-is', without any express or implied warranty.
 You may not hold the author liable.

 Permission is granted to anyone to use this software for any purpose,
 including commercial applications, and to alter it and redistribute it freely,
 subject to the following restrictions:

 The origin of this software must not be misrepresented. You must not claim
 that you wrote the original software. When use the software, you must give
 appropriate credit, provide an active link to the original file, and indicate if changes were made.
 This notice may not be removed or altered from any source distribution.
