/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Alexey Kucherenko <alexei.kucherenko@gmail.com>                  |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  11 May 2019

*/

'use strict';

const mockery = require('mockery');
const { CommandMock, ExecutionContextMock } = require('@tests/mocks');

describe('apis/checkNhsNumber', () => {
  let args;
  let finished;

  let command;
  let CheckNhsNumberCommand;

  let handler;

  beforeAll(() => {
    mockery.enable({
      warnOnUnregistered: false
    });
  });

  afterAll(() => {
    mockery.disable();
  });

  beforeEach(() => {
    args = {
      patientId: 9999999000,
      req: {
        ctx: new ExecutionContextMock()
      },
      session: {
        nhsNumber: 9999999111,
        email: 'john.doe@example.org'
      }
    };
    finished = jasmine.createSpy();

    command = new CommandMock();
    CheckNhsNumberCommand = jasmine.createSpy().and.returnValue(command);
    mockery.registerMock('../../lib/commands', { CheckNhsNumberCommand });

    delete require.cache[require.resolve('@apis/checkNhsNumber')];
    handler = require('@apis/checkNhsNumber');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should return response object', async () => {
    const responseObj = {
      status: 'loading_data',
      new_patient: true,
      responseNo: 1,
      nhsNumber: 9999999000
    };
    command.execute.and.resolveValue(responseObj);

    await handler(args, finished);

    expect(CheckNhsNumberCommand).toHaveBeenCalledWith(args.req.ctx, args.session);
    expect(command.execute).toHaveBeenCalledWith(args.patientId);

    expect(finished).toHaveBeenCalledWith(responseObj);
  });

  it('should return error object', async () => {
    command.execute.and.rejectValue(new Error('custom error'));

    await handler(args, finished);

    expect(CheckNhsNumberCommand).toHaveBeenCalledWith(args.req.ctx, args.session);
    expect(command.execute).toHaveBeenCalledWith(args.patientId);

    expect(finished).toHaveBeenCalledWith({
      error: 'custom error'
    });
  });
});
