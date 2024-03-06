# Computed CSS Style Comparator

This provides a utility in the form of a Docker/Podman container that
fetches two different copies of a page, selects a (unique) element on that
page, and then computes the difference between the value of `getComputedStyle`
when run on that same element on both pages. Additionally, it checks for 
significant differences between the `innerHTML` properties of the
elements being compared.

This is intended to be useful to isolate style changes where complex changes
are involved between different revisions of an application, e.g. when working
with Rails asset pipeline when upgrading a Rails project.

## Usage

Create a file named `config.mjs` modeled on the provided example; the `element`
attribute of the `config` object should be a CSS selector that uniquely matches
an element on the page in question. `sites` should be a two-element array using
the URLs of a current site (e.g. production) and of a site where you are
querying changes.

### Waiting for elemments to be added to the page

Add a `waitForSelector` selector to the configuration; the checker will wait
until an element matching the selector has been added to the page; this will
allow JavaScript that modifies the page after it's been loaded to run.

Alternately, you can add `waitForFunction` which is a string containing a JS
expression that must evaluate to `true` before the checker will evaluate the
target element. This is more flexible and error-prone possibly than the 
`waitForSelector`.  If both are present, then the function/expression will be
used and `waitForSelector` value will be ignored.

## Building

_After_ you have created (or updated) the `config.mjs` and/or the `fetch.mjs`
files, run:

    $ docker build . -t css_compare

## Running

    $ docker run -it --rm css_compare

## Tip For Accessing Sites running on Local Containers

You may be investigating the styling of a locally modified site running in a
container.  Assuming you've used defaults for networks, that site should be
available to the container run by this project at the URL
`http://host.containers.internal:{port exposed to host}`, e.g.
`http://host.containers.internal:3000` for a Rails app running under Puma in
another container.  Note that you may need to adjust `config.hosts` for that
app (e.g. in `config/environments/development.rb`) to allow Rails 6+ to serve
it at that hostname.
