# NodeJS and pnpm

## NodeJS

To install a modern version of NodeJS on your machine, [follow the NodeSource installation instructions](https://github.com/nodesource/distributions#debinstall). If you don't want to execute a script that you download off the internet with `sudo`, there are manual installation instructions further down.

## Global packages that aren't actually global

We need to install pnpm globally, and I don't like giving non-system package managers like (p)npm access to my system directories. It's fairly straightforward to configure npm and pnpm to install packages to your home directory that are discoverable in your `$PATH`.

First, create a directory for your "global" packages in your home directory, like

    $ mkdir ~/.npm

Then, ensure npm and pnpm know about it. Create `~/.npmrc` or edit it if it exists, and add the following line:

    prefix=/home/$USER/.npm

replacing `$USER` with your username.

Finally, ensure the executables that you'll be installing can be found in your `$PATH`. Assuming you're using bash as your shell (and you'd know if you aren't), add the following line to `~/.bashrc`:

    export PATH="/home/$USER/.npm/bin:$PATH"

and run

    $ source ~/.bashrc

to enable the new $PATH in your current terminal session.

## pnpm

Install pnpm with

    $ npm install -g pnpm

And now you can use pnpm whenever you'd use npm, even to update itself:

    $ pnpm install -g pnpm

Further instructions on how to use pnpm can be found [at its website](https://pnpm.io).
