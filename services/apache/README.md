# services/apache - Apache configuration

This directory contains Apache configuration for the Access Platform development environment.
The primary purpose of this configuration is to enable redirection from previous URL's to the current URL's as the platform has changed over tye years.

Using Apache for this is overkill, and a better long-term solution is to impliment the relevant logic in a small NODE application as part of a larger resolver service.


## Example of need for redirection

https://www.unive.it/pag/fileadmin/user_upload/dipartimenti/DSLCC/documenti/DEP/numeri/n5-6/Dep5-6.pdf

has a link to:

http://www.canadiana.org/ECO/ItemRecord/51209?id=20883b82e24b2c31

This needs to redirect to the best we can get to on the new platform, which is currently:

https://www.canadiana.ca/view/oocihm.51209


Further examples that exist in papers written by researchers can be found through a Google Search (always check with Google Books).
This list should not be considered complete, and is an example of articles we should ensure the references work as best they can in the future.

* https://www.google.com/search?q=%22www.canadiana.org%2FECO%2FItemRecord%22
* https://www.google.com/search?q=%22canadiana.org/record/%22
* https://www.google.com/search?q=%22canadiana.org/ECO/mtq%22
* https://www.google.com/search?q=%22canadiana.org%2FECO%2FPageView%22
* https://www.google.com/search?q=%22canadiana.org%2Frecord%22
* https://www.google.com/search?q=%22canadiana.org%2Fnotice%22
* https://www.google.com/search?q=%22canadiana.org%2Fshow%22

Similar queries can be checked against Google Scholar:

* https://scholar.google.ca/scholar?q=%22canadiana.org%2FECO%22

## How the httpd.conf is created

We take the configuration from the image provided at https://hub.docker.com/_/httpd , and do:

```
sed -i \
    -e 's/^#\(LoadModule .*mod_rewrite.so\)/\1/' \
    -e 's/^#\(LoadModule .*mod_allowmethods.so\)/\1/' \
    -e 's/^#\(LoadModule .*mod_remoteip.so\)/\1/' \
    conf/httpd.conf

sed -i \
    -e 's/logs\/httpd.pid/httpd.pid/' \
    conf/extra/httpd-mpm.conf
```

We append extra/httpd-mpm.conf and our virtual host configuration to the httpd.conf, and then commit that here.
Production will then make use of the configuration file that is stored here whenever it needs to be deployed.

## Redirects

* files under /schema and /standards/ which offered static XML documentation now redirect to GitHub
  * http://www.canadiana.ca/schema/2012/txt/aip.txt
  * http://www.canadiana.ca/standards/schema/2012/txt/aip.txt

##   www.canadiana.org

We previously hosted an ECO platform (mod_perl scripts) prior to creating the CAP platform which handled multiple portals and multiple depositors.

This configuration redirects the old URLs to the new format.

  * http://www.canadiana.org/ECO/mtq?doc=00001
  * http://www.canadiana.org/record/8_06638_23
  * http://www.canadiana.org/ECO/PageView/09514/0186?id=4197335cc9aaee1a (Example taken from references on a research paper on google books)
