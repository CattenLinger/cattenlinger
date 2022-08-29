# Create customized tinycore linux

Same as make-tinycore-linux-from-iso, but download core and ramdisk from repo directly.

Usage

- Create a work directory.
- Write the build.rc file (See the example file)

Then:
```
curl -sL 'https://github.com/CattenLinger/cattenlinger/raw/master/tools/make-tinycore-linux/make-tinycore-linux' | sudo bash -
```

The ramdisk and linux core will be copyed to the work directory.

See build.rc.example for more options.