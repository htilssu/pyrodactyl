import { Actions, State, useStoreActions, useStoreState } from 'easy-peasy';
import { Form, Formik, FormikHelpers } from 'formik';
import { Fragment } from 'react';
import * as Yup from 'yup';

import Field from '@/components/elements/Field';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Button } from '@/components/elements/button/index';

import updateAccountPassword from '@/api/account/updateAccountPassword';
import { httpErrorToHuman } from '@/api/http';

import { ApplicationStore } from '@/state';

interface Values {
    current: string;
    password: string;
    confirmPassword: string;
}

const schema = Yup.object().shape({
    current: Yup.string().min(1).required('You must provide your current account password.'),
    password: Yup.string().min(8).required(),
    confirmPassword: Yup.string().test(
        'password',
        'Password confirmation does not match the password you entered.',
        function (value) {
            return value === this.parent.password;
        },
    ),
});

export default () => {
    const user = useStoreState((state: State<ApplicationStore>) => state.user.data);
    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    if (!user) {
        return null;
    }

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('account:password');
        updateAccountPassword({ ...values })
            .then(() => {
                // @ts-expect-error this is valid
                window.location = '/auth/login';
            })
            .catch((error) =>
                addFlash({
                    key: 'account:password',
                    type: 'error',
                    title: 'Error',
                    message: httpErrorToHuman(error),
                }),
            )
            .then(() => setSubmitting(false));
    };

    return (
        <Formik
            onSubmit={submit}
            validationSchema={schema}
            initialValues={{ current: '', password: '', confirmPassword: '' }}
        >
            {({ isSubmitting, isValid }) => (
                <Fragment>
                    <SpinnerOverlay size={'large'} visible={isSubmitting} />
                    <Form className={`m-0`}>
                        <Field id={'current_password'} type={'password'} name={'current'} label={'Mật khẩu cũ'} />
                        <div className={`mt-6`}>
                            <Field
                                id={'new_password'}
                                type={'password'}
                                name={'password'}
                                label={'Mật khẩu mới'}
                                description={
                                    'Mật khẩu mới của bạn phải chứa ít nhất 8 ký tự và không được trùng với mật khẩu hiện tại.'
                                }
                            />
                        </div>
                        <div className={`mt-6`}>
                            <Field
                                id={'confirm_new_password'}
                                type={'password'}
                                name={'confirmPassword'}
                                label={'Xác nhận mật khẩu mới'}
                            />
                        </div>
                        <div className={`mt-6`}>
                            <Button disabled={isSubmitting || !isValid}>Cập nhật mật khẩu</Button>
                        </div>
                    </Form>
                </Fragment>
            )}
        </Formik>
    );
};
