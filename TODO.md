1. Move basically the whole of lapin to a package. This will let us do some neat stuff with service-specific Docker images, while still letting us use the Lapin router type in admin.
2. Separate pnpm install from pnpm everything else
3. lapin and p-o-c services
4. Document what's up with data.
5. Document what's up with couch-utils.
6. Document what's up with lapin.
7. Add auth stuff to proof-of-concept. Ensure that it can get passed as headers to lapin.
8. Come up with a way to test lapin.
