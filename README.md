# COVID Helper Bot

This is the source code for the framework that powers [COVID Helper Bot](https://twitter.com/COVID_Helper).

The project is [running on Glitch](https://glitch.com/edit/#!/remix/covid-helper-bot). Feel free to remix it!

## How does it work

The conversation flow logic is implemented as a finite-state machine. You can create set of YAML files containing chat bubbles and quick reply options. The `agent` module interprets the files and feeds the appropriate bubble to the conversation flow based on the quick reply option from the user. Keyboard input repeats the last message.

```
  scripts
  |--- en-us (English - US)
     |--- main.yaml (Welcome message and language selector)
     |--- for-me.yaml (US main menu)
     |--- help-others.yaml (US - how to help others)
  |--- it-it (Italy - Italian)
     |--- for-me.yaml (Italian main menu and options)
     |--- telefoni.yaml (Italy's regional phone numbers)
  |--- es-es (Spain - Spanish)
     |--- for-me.yaml (Spain main menu and options)
     |--- telefonos.yaml (Spain's regional phone numbers)
```

Each file contains one of more sections. Each section represents a chat bubble (complete with quick replies), and it is tagged with a label. The main label is `start`.

To advance the conversation, users will select a quick reply option. Each option contains metadata, which is the reference to the next script file and bubble

## Building a YAML file for your language

This framework can support multiple conversation flows. This is useful for example to create multiple pathways based on language preferences, or to easily split a flow into smaller files for easier editing and maintenance. The `scripts` folder is organized in locales and sections.

* Copy a folder (e.g. `it-it`) into the language you wish to support. For example, for France, you can copy the folder into `fr-fr`.
* Localize the main menu (located in `for-me.yaml`)
* Add the option for your language in `scripts/en-us/main.yaml`.

Not all locales have the same files. This is because the information is localized for the specific country/language combination.

Each file contains one or more chat bubbles. Each bubble is marked with a tag (e.g. `start`, or `regions`). Each bubble will list one or more `options`. Each option will have:

- A `name` (up to 36 characters long)
- A `description` (up to 72 characters long)
- A `metadata` field that will trigger the next bubble. The format must be `path/to/filename.yaml#bubble-tag`, for example (`scripts/en-us/for-me.yaml#donate`)

Take a look at the `scripts` folder for implementation examples.

## Contributing

You're welcome to submit a pull request for new languages and functionality. If you are building a new language, make sure you include the following details in the pull request:

- Your Twitter username
- The name of the language (e.g. `French`)
- The local name of the language (e.g. `François`)
- The sources for your content. **Important:** only use authoritative official sources or the PR may not get merged.
- The licensing information for your content. **Important:** ensure the content license allows repurposing content for non-commercial purposes.