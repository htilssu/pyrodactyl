import clsx from 'clsx';
import React from 'react';

import CopyOnClick from '@/components/elements/CopyOnClick';

import styles from './style.module.css';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    children: React.ReactNode;
    className?: string;
}

export default function StatBlock({ title, copyOnClick, className, children }: Readonly<StatBlockProps>) {
    return (
        <CopyOnClick text={copyOnClick}>
            <div className={clsx(styles.stat_block, 'bg-[#ffffff09] border-[1px] border-[#ffffff11]', className)}>
                <div className={'flex flex-col justify-center overflow-hidden w-full'}>
                    <p className={'leading-tight text-xs md:text-sm text-zinc-400'}>{title}</p>
                    <div className={'text-[32px] font-extrabold leading-[98%] tracking-[-0.07rem] w-full truncate'}>
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
}
