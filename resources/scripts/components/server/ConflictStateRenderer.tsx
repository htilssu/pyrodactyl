import ScreenBlock from '@/components/elements/ScreenBlock';

import { ServerContext } from '@/state/server';

import Spinner from '../elements/Spinner';

export default () => {
    const status = ServerContext.useStoreState((state) => state.server.data?.status || null);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data?.isTransferring || false);
    const isNodeUnderMaintenance = ServerContext.useStoreState(
        (state) => state.server.data?.isNodeUnderMaintenance || false,
    );

    return status === 'installing' || status === 'install_failed' || status === 'reinstall_failed' ? (
        <div className={'flex items-center justify-center h-full'}>
            <Spinner size={'large'} />
            <div className='flex flex-col ml-4'>
                <label className='text-neutral-100 text-lg font-bold'>Server đang được cài đặt</label>
                <label className='text-neutral-500 text-md font-semibold'>
                    Server của bạn sẽ hoàn thành sớm trong thời gian tới.
                </label>
            </div>
        </div>
    ) : status === 'suspended' ? (
        <ScreenBlock title={'Server Suspended'} message={'This server is suspended and cannot be accessed.'} />
    ) : isNodeUnderMaintenance ? (
        <ScreenBlock
            title={'Node under Maintenance'}
            message={'The node of this server is currently under maintenance.'}
        />
    ) : (
        <ScreenBlock
            title={isTransferring ? 'Transferring' : 'Restoring from Backup'}
            message={
                isTransferring
                    ? 'Your server is being transferred to a new node, please check back later.'
                    : 'Your server is currently being restored from a backup, please check back in a few minutes.'
            }
        />
    );
};
