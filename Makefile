# Default shell
SHELL := /bin/bash

# Default goal
.DEFAULT_GOAL := help

# Variables
MAKE_NPM_EXE ?= npm
MAKE_NODE_EXE ?= node

MAKE_NPM ?= ${MAKE_NPM_EXE}
MAKE_NODE ?= ${MAKE_NODE_EXE}

# Goals
.PHONY: help
help:
	@echo 'Usage:'
	@echo '  make <target>'
	@echo ''
	@echo 'Mission-critical delivery flows:'
	@echo '  local'
	@echo '                    Prepare the local developer environment build.'
	@echo '  ci'
	@echo '                    Prepare the continuous integration environment build.'
	@echo '  development'
	@echo '                    Prepare the shared development-ready environment build.'
	@echo '  qa'
	@echo '                    Prepare the QA validation environment build.'
	@echo '  staging'
	@echo '                    Prepare the staging certification environment build.'
	@echo '  production'
	@echo '                    Prepare the production release environment build.'
	@echo ''
	@echo 'Application runtime interface:'
	@echo '  start | serve | up | server | dev'
	@echo '                    Boot the development HTTP server.'
	@echo ''
	@echo 'Quality gates & assurance:'
	@echo '  check'
	@echo '                    Execute the end-to-end quality gate before promotion.'
	@echo '  test'
	@echo '                    Run the full automated test campaign.'
	@echo '  coverage'
	@echo '                    Host the local web console for the latest coverage run.'
	@echo '  lint'
	@echo '                    Execute all linters across source code and assets.'
	@echo '  fix'
	@echo '                    Autofix style and formatting deviations across stacks.'
	@echo '  stan'
	@echo '                    Run advanced static analysis for the PHP domain.'
	@echo '  audit'
	@echo '                    Assess dependency health and supply-chain posture.'
	@echo ''
	@echo 'Dependencies & environment:'
	@echo '  install'
	@echo '                    Provision all runtime dependencies for the project.'
	@echo '  update'
	@echo '                    Refresh dependencies to the latest approved revisions.'
	@echo ''
	@echo 'Housekeeping & recovery:'
	@echo '  clean'
	@echo '                    Purge build caches and dependency artifacts.'
	@echo '  distclean'
	@echo '                    Reset the project to a pristine state.'
	@echo ''
	@echo 'Meta:'
	@echo '  help'
	@echo '                    Show this operational guide.'

.PHONY: build
build: favicons
	${MAKE_NPM} run build

.PHONY: start serve up server dev
start serve up server dev: favicons
	${MAKE_NPM} run start

.PHONY: audit
audit: audit_npm

.PHONY: audit_npm
audit_npm: ./node_modules ./package.json ./package-lock.json
	${MAKE_NPM} run npm:audit

.PHONY: check
check: lint stan test audit

.PHONY: clean
clean:
	rm -rf ./node_modules
	rm -rf ./package-lock.json

.PHONY: distclean
distclean: clean
	rm -rf ./dist
	rm -rf ./public/favicon*
	rm -rf ./public/icon*
	rm -rf ./public/apple-touch-icon*

.PHONY: fix
fix: fix_eslint fix_prettier fix_stylelint

.PHONY: fix_eslint
fix_eslint: ./node_modules ./eslint.config.js
	${MAKE_NPM} run fix:eslint

.PHONY: fix_prettier
fix_prettier: ./node_modules ./prettier.config.js
	${MAKE_NPM} run fix:prettier

.PHONY: fix_stylelint
fix_stylelint: ./node_modules ./stylelint.config.js
	${MAKE_NPM} run fix:stylelint

.PHONY: lint
lint: lint_eslint lint_prettier lint_stylelint

.PHONY: lint_eslint
lint_eslint: ./node_modules ./eslint.config.js
	${MAKE_NPM} run lint:eslint

.PHONY: lint_prettier
lint_prettier: ./node_modules ./prettier.config.js
	${MAKE_NPM} run lint:prettier

.PHONY: lint_stylelint
lint_stylelint: ./node_modules ./stylelint.config.js
	${MAKE_NPM} run lint:stylelint

.PHONY: stan
stan: stan_typescript

.PHONY: stan_typescript
stan_typescript: ./node_modules ./tsconfig.json
	${MAKE_NPM} run stan:typescript

.PHONY: test
test: test_playwright

.PHONY: test_playwright
test_playwright: ./node_modules ./playwright.config.js
	${MAKE_NPM} run playwright:install
	${MAKE_NPM} run playwright:test

.PHONY: install
install: install_npm

.PHONY: install_npm
install_npm: ./package.json
	${MAKE_NPM} run npm:install

.PHONY: update
update: update_npm

.PHONY: update_npm
update_npm: ./package.json
	rm -rf ./node_modules
	rm -rf ./package-lock.json
	${MAKE_NPM} run npm:update

.PHONY: favicons
favicons: ./assets/icons/icon.svg
	convert ./assets/icons/icon.svg -background none -density 300 -define icon:auto-resize=16,32,48 ./public/favicon.ico
	convert ./assets/icons/icon.svg -background none -density 300 -resize 16x16 ./public/favicon-16x16.png
	convert ./assets/icons/icon.svg -background none -density 300 -resize 32x32 ./public/favicon-32x32.png
	convert ./assets/icons/icon.svg -background none -density 300 -resize 48x48 ./public/favicon-48x48.png
	convert ./assets/icons/icon.svg -background none -density 300 -resize 180x180 ./public/apple-touch-icon.png
	convert ./assets/icons/icon.svg -background none -density 300 -resize 192x192 ./public/icon-192x192.png
	convert ./assets/icons/icon.svg -background none -density 300 -resize 512x512 ./public/icon-512x512.png
	convert ./assets/icons/icon.svg -background none -density 300 -resize 154x154 ./node_modules/temp.png
	convert -size 192x192 canvas:none ./node_modules/temp.png -gravity center -composite ./public/icon-192x192-maskable.png
	convert ./assets/icons/icon.svg -background none -density 300 -resize 410x410 ./node_modules/temp.png
	convert -size 512x512 canvas:none ./node_modules/temp.png -gravity center -composite ./public/icon-512x512-maskable.png
	cp ./assets/icons/icon.svg ./public/favicon.svg

.PHONY: postcreate
postcreate:
	${MAKE} build

# Dependencies
./package-lock.json ./node_modules:
	${MAKE} install
