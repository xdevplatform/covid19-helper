const Agent = require('../agent');
const agent = new Agent();
const assert = require('assert');

const start = 'scripts/en-us/main.yaml#start'
const expectedStepFile = 'scripts/en-us/main.yaml#start';
const expectedOption = 'scripts/en-us/for-me.yaml#start';
agent.step(start);
const [expectedFile, expectedEntryPoint] = expectedStepFile.split('#');
assert.equal(agent.file, expectedFile);
assert.equal(agent.entryPoint, expectedEntryPoint);

const options = agent.currentStep().options;
assert.equal(Array.isArray(options), true)
assert.equal(options.length, 3);
assert.equal(options[0].metadata, expectedOption);
agent.step(options[0].metadata);
const [firstStepExpectedFile, firstStepExpectedEntryPoint] = options[0].metadata.split('#');
assert.equal(agent.file, firstStepExpectedFile);
assert.equal(agent.entryPoint, firstStepExpectedEntryPoint);
