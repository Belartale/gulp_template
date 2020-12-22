// @@include("name")
// files from -name.html don't save in folder "dist"

// npm i -D gulp-

// task for start
// gulp s == svg sprite
// gulp f == font
// gulp d == delete class inside css of html

let project_folder = "dist"; //require("path").basename(__dirname);
let source_folder = "src"; //"#src";

//! file paths

let style = `scss`;
let styleType = `scss`;
let JS = `index`;
let imgTypes = `*`; //? `{jpg, png, svg, gif, ico, webp}`;
let doNotMake = `_`;

let path = {
	build: {
		html: `${project_folder}/`,
		css: `${project_folder}/css/`,
		js: `${project_folder}/js/`,
		img: `${project_folder}/img/`,
		fonts: `${project_folder}/fonts/`,
		plugins: `${project_folder}/plugins/`,
	},
	src: {
		pug: [
			`${source_folder}/**/*.pug`,
			`!${source_folder}/**/${doNotMake}*.pug`,
		],
		html: [
			`${source_folder}/**/.html`,
			`!${source_folder}/**/${doNotMake}*.html`,
		],
		css: `${source_folder}/${style}/index.${styleType}`,
		js: `${source_folder}/js/${JS}.js`,
		img: [
			`${source_folder}/img/**/*.${imgTypes}`,
			`!${source_folder}/img/${doNotMake}**/*`,
		],
		fonts: `${source_folder}/fonts/*.ttf`,
		plugins: [
			`${source_folder}/plugins/**/*.*`,
			`!${source_folder}/plugins/${doNotMake}**/*.*`,
		],
	},
	watch: {
		pug: `${source_folder}/**/*.pug`,
		html: `${source_folder}/**/*.html`,
		css: `${source_folder}/${style}/**/*.${styleType}`,
		js: `${source_folder}/js/**/*.js`,
		img: `${source_folder}/img/**/*.${imgTypes}`,
		plugins: `${source_folder}/plugins/**/*.*`,
	},
	clean: `./${project_folder}/`,
};

//todo variables

let { src, dest } = require("gulp"),
	gulp = require("gulp"), // галп
	browsersync = require("browser-sync").create(), // обновление страницы
	del = require("del"), // очистка
	pug = require("gulp-pug"), // pug
	scss = require("gulp-sass"), // sass/scss
	fileInclude = require("gulp-file-include"), // include
	autoprefixer = require("gulp-autoprefixer"), // добавление префиксов для свойств
	group_media = require("gulp-group-css-media-queries"), // медиа в кучу и в конец
	// clean_css = require("gulp-clean-css"), // минимизация css
	rename = require("gulp-rename"), // извенить имя //todo заменить на gulp-concat
	uglify = require("gulp-uglify-es").default, // минимизация js
	imagemin = require("gulp-imagemin"), // сжатие картинок
	webp = require("gulp-webp"), // формат webp
	webphtml = require("gulp-webp-html"), // формат webp для html
	webpcss = require("gulp-webpcss"), //! replace "gulp-webp-css"
	svgsprite = require("gulp-svg-sprite"), //?
	ttf2woff = require("gulp-ttf2woff"), // изменение формата шрифтов
	ttf2woff2 = require("gulp-ttf2woff2"), //
	fonter = require("gulp-fonter"),
	purgecss = require("gulp-purgecss"); //удаление лишних слассов

//todo function

function browserSync(params) {
	browsersync.init({
		server: {
			baseDir: "./" + project_folder + "/",
		},
		port: 3000,
		notify: false,
	});
}

function plugins() {
	return src(path.src.plugins)
		.pipe(dest(path.build.plugins))
		.pipe(browsersync.stream());
}

function funPug() {
	return src(path.src.pug)
		.pipe(
			pug({
				pretty: true,
			})
		)
		.pipe(webphtml())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream());
}

function html() {
	return src(path.src.html)
		.pipe(fileInclude())
		.pipe(webphtml())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream());
}

function css() {
	return src(path.src.css)
		.pipe(scss())
		.pipe(group_media())
		.pipe(
			scss({
				outputStyle: "compressed",
			})
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 5 versions"],
				grid: true,
				cascade: false,
			})
		)
		.pipe(webpcss())

		.pipe(
			rename({
				extname: ".min.css",
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream());
}

function js() {
	return src(path.src.js)
		.pipe(fileInclude())
		.pipe(uglify())
		.pipe(
			rename({
				extname: ".min.js",
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream());
}

function images() {
	return src(path.src.img)
		.pipe(
			webp({
				quality: 70,
			})
		)
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))
		.pipe(
			imagemin({
				progressive: true,
				svgPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3, //todo 0-7
			})
		)
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream());
}

function fonts() {
	src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));
	return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts));
}

function svgSprite() {
	return src([source_folder + "/img/_sprite/*.svg"])
		.pipe(
			svgsprite({
				mode: {
					stack: {
						sprite: "../icons/icons.svg",
						example: true,
					},
				},
			})
		)
		.pipe(dest(path.build.img));
}

gulp.task("s", svgSprite);

function fontToTtf() {
	return gulp([source_folder + "/fonts/*.otf"])
		.pipe(
			fonter({
				format: ["ttf"],
			})
		)
		.pipe(dest(source_folder + "/fonts/"));
}

gulp.task("f", fontToTtf);

function cleanClassOfHtml() {
	return src([path.build.css + "*.css", path.build.css + "*.min.css"])
		.pipe(
			purgecss({
				content: [path.build.html + "index.html"],
			})
		)
		.pipe(dest(path.build.css));
}

gulp.task("d", cleanClassOfHtml);

let fs = require("fs");

function fontsStyle(params) {
	let file_content = fs.readFileSync(source_folder + "/scss/fonts.scss");
	if (file_content == "") {
		fs.writeFile(source_folder + "/scss/fonts.scss", "", cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split(".");
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(
							`${source_folder}/${style}/fonts.scss`,
							'@include font("' +
								fontname +
								'", "' +
								fontname +
								'", "400", "normal");\r\n',
							cb
						);
					}
					c_fontname = fontname;
				}
			}
		});
	}
}

function cb() {}

function watchFiles() {
	gulp.watch([path.watch.pug], funPug);
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], images);
	gulp.watch([path.watch.plugins], plugins);
}

function clean() {
	return del(path.clean);
}

let build = gulp.series(
	clean,
	funPug,
	plugins,
	gulp.parallel(css, html, js, images, svgSprite, fonts),
	fontsStyle
); //before
let watch = gulp.parallel(build, browserSync, watchFiles); //after

exports.funPug = funPug;
exports.plugins = plugins;
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.svgSprite = svgSprite;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
