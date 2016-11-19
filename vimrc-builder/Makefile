#TODO Known bads:
#  the syntax is following the suggested common rules?
#  i cannot pass strings that start with "#" to appendModules
#  this line of code, in appendModule, should be changed: $(call getName, $(input)) '---' >> $(output) . In fact, every comments should be written by writeComment: how to return a value from getName?
#  running make, the .vimrc is always rebuilded, even when the modules weren't modified. Can more be done?

# .vimrc's (input) folders
ROOT_FOLDER = $(shell pwd)
KEYMAPS_FOLDER = $(ROOT_FOLDER)/keymaps
PLUGINS_FOLDER = $(ROOT_FOLDER)/plugins
PLUGINS_DEPS_FOLDER = $(ROOT_FOLDER)/plugins/dependencies
PLUGINS_KEYMAPS_FOLDER = $(ROOT_FOLDER)/plugins/keymaps

# vimrc's modules: these files will be appended into the .vimrc
GENERIC_MODS = $(wildcard $(ROOT_FOLDER)/*.vimrcp)
KEYMAPS_MODS = $(wildcard $(KEYMAPS_FOLDER)/*.vimrcp)
PLUGINS_MODS = $(wildcard $(PLUGINS_FOLDER)/*.vimrcp)
PLUGINS_DEPS_HEAD_MOD = $(PLUGINS_DEPS_FOLDER)/vundle-head.vimrcp
PLUGINS_DEPS_FOOT_MOD = $(PLUGINS_DEPS_FOLDER)/vundle-foot.vimrcp
PLUGINS_KEYMAPS_MODS = $(wildcard $(PLUGINS_KEYMAPS_FOLDER)/*.vimrcp)

# .vimrc output
OUTPUT_FOLDER = $(shell pwd)
OUTPUT_NAME = .vimrc
OUTPUT_FILE = $(OUTPUT_FOLDER)/$(OUTPUT_NAME)

# the modules above will be separated by this inside the .vimrc
# it was '\n', as new line, but in some machines the new line was added as
# string and not as new line! TODO check it again
SEPARATOR = ''

# Builder flags and bin
COMPILER_FLAGS = # fill me with your preferences
COMPILER_BIN = @cat

# takes as parameter a filename with path and extension and returns just the filename; helpful to write the module's name inside the .vimrc, as comment
define getName
$(eval fullNameAndPath = $(1))
$(eval fullName = $(lastword $(subst /, ,$(fullNameAndPath))))
$(eval name = $(firstword $(subst ., ,$(fullName))))
$(eval name = $(subst  ,,$(name)))
@echo $(name)
endef

# appends the file list as parameter (index 3) to the output file. It adds section opener and closer (as parameters) as string (indexes 1 and 2)
define appendModules
$(eval sectionNameHead = $(1))
$(eval sectionNameFoot = $(2))
$(eval moduleList = $(3))
$(if $(value sectionNameHead), $(call writeComment, $(sectionNameHead)),)
$(foreach mod, $(moduleList), $(call appendModule, $(mod));)
$(if $(value sectionNameHead), $(call writeComment, $(sectionNameFoot)),)
@echo -n $(SEPARATOR) >> $(OUTPUT_FILE)
@echo -n $(SEPARATOR) >> $(OUTPUT_FILE)
endef

# appends the input file (as parameter) into the output file
define appendModule
$(eval input = $(1))
$(eval output = $(OUTPUT_FILE))
$(call writeComment, '--- ', "nonewline")
$(call getName, $(input)) '---' >> $(output) 
$(COMPILER_BIN) $(COMPILER_FLAGS) $(input) >> $(OUTPUT_FILE)
@echo -n $(SEPARATOR) >> $(OUTPUT_FILE)
endef

# appends the input comment into the output file; specifing any second paramenter, will be not added a new line with the comment. For the readibility, I use "nonewline" as second paramenter when needed
define writeComment
$(eval text = $(1))
$(eval options = $(2))
$(if $(options), $(eval options = '-n'),)
@echo $(value options) '"' $(1) >> $(OUTPUT_FILE)
endef

.vimrc:
	@echo "Writing generic modules, from the root folder..."
	$(call appendModules, "*** generic ***", "*** end generic ***", $(GENERIC_MODS))
	@echo "Writing generic keymaps, from the root/keymaps folder..."
	$(call appendModules, '*** keymaps ***', '*** end keymaps ***', $(KEYMAPS_MODS))
	@echo "Writing plugins; starting with vundle head..."
	$(call writeComment, ' *** plugins ***')
	$(call appendModule, $(PLUGINS_DEPS_HEAD_MOD))
	@echo "Writing the plugins, in root/plugins folder..."
	$(call appendModules, '  ** plugins **', '', $(PLUGINS_MODS))
	@echo "Writing  the keymaps for plugins, in root/plugins/keymaps..."
	$(call appendModules, '  ** plugins keymaps **', '', $(PLUGINS_KEYMAPS_MODS))
	@echo "Writing vundle foot, to finish the plugins section..."
	$(call appendModule, $(PLUGINS_DEPS_FOOT_MOD))
	$(call writeComment, ' *** end plugins ***')
	@echo "Done!"

.PHONY: build clean all
all:
	make clean build
build:
	make .vimrc
clean:
	@if test -f $(OUTPUT_NAME); then rm $(OUTPUT_NAME); fi;
