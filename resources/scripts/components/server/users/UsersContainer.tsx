import { Actions, useStoreActions, useStoreState } from 'easy-peasy';
import { For } from 'million/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FlashMessageRender from '@/components/FlashMessageRender';
import Can from '@/components/elements/Can';
import { MainPageHeader } from '@/components/elements/MainPageHeader';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { PageListContainer } from '@/components/elements/pages/PageList';
import AddSubuserButton from '@/components/server/users/AddSubuserButton';
import UserRow from '@/components/server/users/UserRow';

import { httpErrorToHuman } from '@/api/http';
import getServerSubusers from '@/api/server/users/getServerSubusers';

import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';

export default () => {
    const [loading, setLoading] = useState(true);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const subusers = ServerContext.useStoreState((state) => state.subusers.data);
    const setSubusers = ServerContext.useStoreActions((actions) => actions.subusers.setSubusers);

    const permissions = useStoreState((state: ApplicationStore) => state.permissions.data);
    const getPermissions = useStoreActions((actions: Actions<ApplicationStore>) => actions.permissions.getPermissions);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const { t } = useTranslation();

    useEffect(() => {
        clearFlashes('users');
        getServerSubusers(uuid)
            .then((subusers) => {
                setSubusers(subusers);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                addError({ key: 'users', message: httpErrorToHuman(error) });
            });
    }, []);

    useEffect(() => {
        getPermissions().catch((error) => {
            addError({ key: 'users', message: httpErrorToHuman(error) });
            console.error(error);
        });
    }, []);

    if (!subusers.length && (loading || !Object.keys(permissions).length)) {
        return (
            <ServerContentBlock title={'Users'}>
                <h1 className='text-[52px] font-extrabold leading-[98%] tracking-[-0.14rem]'>
                    {t('server_titles.users')}
                </h1>
            </ServerContentBlock>
        );
    }

    return (
        <ServerContentBlock title={'Users'}>
            <FlashMessageRender byKey={'users'} />
            <MainPageHeader title={t('server_titles.users')}>
                <Can action={'user.create'}>
                    <AddSubuserButton />
                </Can>
            </MainPageHeader>
            {!subusers.length ? (
                <p className={`text-center text-sm text-zinc-300`}>{t('server_users.no_additional_users')}</p>
            ) : (
                <PageListContainer data-pyro-users-container-users>
                    <For each={subusers} memo>
                        {(subuser) => <UserRow key={subuser.uuid} subuser={subuser} />}
                    </For>
                </PageListContainer>
            )}
        </ServerContentBlock>
    );
};
