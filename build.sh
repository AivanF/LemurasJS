
echo "----- Building Lemuras JS -----"

debug=0

while test $# -gt 0; do
case "$1" in
	-D|--debug)
		debug=1
		shift
		;;
	*)
		echo "Unknown arg" $1
		shift
		;;
	esac
done

printf "Lines of code: "
find ./lemuras "(" -name "*.js" ")" -print0 | xargs -0 wc -l | tail -1 | awk '{print $1;}'

# Combine files
ncc build ./lemuras/init.js -o dist

if [ $debug -eq 0 ]; then
	echo "Prod version"
	# Minify it
	uglifyjs ./dist/index.js > ./dist/min.js
else
	echo "Debug version"
	# Put as is
	cat ./dist/index.js > ./dist/min.js
fi

# Wrap as a module
cat ./other/header.js > ./lemuras.js
cat ./dist/min.js >> ./lemuras.js
cat ./other/footer.js >> ./lemuras.js
