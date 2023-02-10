/* globals gauge*/
const { UrlLoader, ValueReplacerHandler } = require('@boart/core');
const { StepReport } = require('@boart/protocol');

const { openBrowser, waitFor, write, closeBrowser, goto, press, into, textBox } = require('taiko');

step(
    'onboarding - change password <company_id>, username: <username>, password: <password>, new-password: <new_password>',
    async (company_id, username, password, new_password) => {
        company_id = ValueReplacerHandler.replace(company_id);
        username = ValueReplacerHandler.replace(username);
        password = ValueReplacerHandler.replace(password);
        new_password = ValueReplacerHandler.replace(new_password);

        const url = `${UrlLoader.url('<ob>/smart-onboarding/register')}/${company_id}?lang=en`;

        StepReport.report('Change Password', 'Register') //
            .addInput('Change Password via UI Browser', {
                url,
                username,
                password,
                new_password
            });

        await openBrowser({
            headless: true
        });

        await goto(`${url}/${company_id}?lang=en`, { navigationTimeout: 1200000 });
        await waitFor(textBox({ id: 'username' }));
        await write(username, into(textBox({ id: 'username' })));
        await waitFor(textBox({ id: 'password' }));
        await write(password, into(textBox({ id: 'password' })));
        await press('Enter');

        await waitFor(textBox({ id: 'password-new' }));
        await write(new_password, into(textBox({ id: 'password-new' })));
        await waitFor(textBox({ id: 'password-confirm' }));
        await write(new_password, into(textBox({ id: 'password-confirm' })));
        await press('Enter');

        await closeBrowser();
    }
);
