
echo "----- Building Lemuras JS -----"

printf "Lines of code: "
find ./lemuras "(" -name "*.js" ")" -print0 | xargs -0 wc -l | tail -1 | awk '{print $1;}'

# Combine files
ncc build ./lemuras/init.js -o dist

# Minify it
uglifyjs ./dist/index.js >> ./dist/min.js
# Debugging way
# cat ./dist/index.js >> ./dist/min.js

# Wrap as a module
cat ./other/header.js > ./lemuras.js
cat ./dist/min.js >> ./lemuras.js
cat ./other/footer.js >> ./lemuras.js
