// @@include("name")
// files from -name.html don't save in folder "dist"

let project_folder = "dist"; //require("path").basename(__dirname);
let source_folder = "src"; //"#src";

let fs = require("fs");

//! file paths

let style = "scss";
let styleType = "scss";
let JS = "index";

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
		pug: `${source_folder}/*.pug`,
		html: [`${source_folder}/*.html`, `!${source_folder}/-*.html`],
		css: `${source_folder}/${style}/index.${styleType}`,
		js: `${source_folder}/js/${JS}.js`,
		img: `${source_folder}/img/**/*.{jpg, png, svg, gif, ico, webp}`,
		fonts: `${source_folder}/fonts/*.ttf`,
		plugins: `${source_folder}/plugins/**/*.*`,
	},
	watch: {
		pug: `${source_folder}/**/*.pug`,
		html: `${source_folder}/**/*.html`,
		css: `${source_folder}/${style}/**/*.${styleType}`,
		js: `${source_folder}/js/**/*.js`,
		img: `${source_folder}/img/**/*.{jpg, png, svg, gif, ico, webp}`,
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
	rename = require("gulp-rename"), // извенить имя //todo заменить на gulp-concat
	uglify = require("gulp-uglify-es").default, // минимизация js
	imagemin = require("gulp-imagemin"), // сжатие картинок
	webp = require("gulp-webp"), // формат webp
	webphtml = require("gulp-webp-html"), // формат webp для html
	webpcss = require("gulp-webpcss"), //! replace "gulp-webp-css"
	svgSprite = require("gulp-svg-sprite"), //
	ttf2woff = require("gulp-ttf2woff"), // изменение формата шрифтов
	ttf2woff2 = require("gulp-ttf2woff2"), //
	fonter = require("gulp-fonter"),
	purgecss = require("gulp-purgecss"); //удаление лишних слассов
// clean_css = require("gulp-clean-css"), // минимизация css

// "gulp-clean-css": "^4.3.0",

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
		.pipe(dest(source_folder))
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

gulp.task("f", function () {
	return gulp([source_folder + "/fonts/*.otf"])
		.pipe(
			fonter({
				format: ["ttf"],
			})
		)
		.pipe(dest(source_folder + "/fonts/"));
});

gulp.task("s", function () {
	return gulp([source_folder + "/iconsprite/*.svg"])
		.pipe(
			svgSprite({
				mode: {
					stack: {
						sprite: "../icons/icons.svg",
						//? example: true,
					},
				},
			})
		)
		.pipe(dest(path.build.img));
});

gulp.task("d", () => {
	return src([path.build.css + "*.css", path.build.css + "*.min.css"])
		.pipe(
			purgecss({
				content: [path.build.html + "index.html"],
			})
		)
		.pipe(dest(path.build.css));
});

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

function watchFiles(params) {
	gulp.watch([path.watch.pug], funPug);
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], images);
	gulp.watch([path.watch.plugins], plugins);
}

function clean(params) {
	return del(path.clean);
}

let build = gulp.series(
	clean,
	funPug,
	plugins,
	gulp.parallel(css, html, js, images, fonts),
	fontsStyle
); //before
let watch = gulp.parallel(build, browserSync, watchFiles); //after

exports.funPug = funPug;
exports.plugins = plugins;
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
