module.exports = function(eleventyConfig) {
    // Your existing passthrough copy configurations
    eleventyConfig.addPassthroughCopy('src/css/style.css');
    eleventyConfig.addPassthroughCopy('src/css/blog.css');
    eleventyConfig.addPassthroughCopy('src/js');
    eleventyConfig.addPassthroughCopy('src/admin');
    eleventyConfig.addPassthroughCopy('src/assets');
    
    const nunjucks = require("nunjucks");
    eleventyConfig.setLibrary("njk", nunjucks.configure("src/_includes"));

    // Adding a collection for posts tagged with 'stories'
    eleventyConfig.addCollection("stories", function(collectionApi) {
        return collectionApi.getFilteredByTag("stories");
    });
    
    return {
        dir: {
            input: 'src',
            includes: "_includes",
            output: 'public',
            templateFormats: ["njk", "html", "md"]
        }
    };
};
