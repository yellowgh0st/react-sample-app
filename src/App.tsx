import React, { useState } from 'react';
import { themeDefault, getImageExtension } from './common/defaults'

import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';

import wrapper from './scss/wrapper.module.scss';
import theme from './scss/theme.module.scss';
import connection from './eWayAPI/Connector';
import { TContactsResopnse } from './eWayAPI/ContactsResponse';

const Form = (props: { children: React.ReactElement, width?: string | number, style?: object,
onSubmit?: any }) => {
    const styles = {
        width: props.width,
        ...props.style || {}
    }

    return (
        <form onSubmit={props.onSubmit} style={styles}>
            {props.children}
        </form>
    )
};

const Footer = (props: { children: React.ReactElement, width?: string | number, style?: object }) => {
    const styles = {
        display: 'block',
        position: 'absolute' as 'absolute',
        width: props.width,
        bottom: 0,
        ...props.style || {}
    }

    return (
        <footer style={styles}>
            {props.children}
        </footer>
    )
}

const App = () => {

    interface Agent {
        FileAs: string,
        ProfilePicture: string
    }

    const email = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/); // Basic validation, not enough time to use more complex solutions

    const [query, setQuery] = useState<string>('')
    const [valid, setValid] = useState<boolean>(false)
    const [agent, setAgent] = useState<Agent | null>(null)
    const [message, setMessage] = useState<string | undefined>(undefined)
    const [appTheme, setAppTheme] = useState<string>(themeDefault)
    const [loading, setLoading] = useState<boolean>(false)

    const dialogContentProps = {
        type: DialogType.normal,
        title: agent ? `${agent.FileAs}` : 'No agent',
        showCloseButton: false,
        isDraggable: false,
    };

    const dialogStyles = {
        main: {
            textAlign: 'center'
        }
    };

    const modalProps = {
        isBlocking: true
    };

    const findContact = async () => {
        setLoading(true)
        setTimeout(() => {
                connection.callMethod(
                    'SearchContacts', // Query
                    {
                        transmitObject: {
                            Email1Address: query // By what
                        },
                        includeProfilePictures: true // Specific param
                    },
                    (result: TContactsResopnse) => { // Answer
                        const data = result.Data.length !== 0 ? result.Data[0] : null
                        if (data) {
                            setAgent({
                                FileAs: data.FileAs,
                                ProfilePicture: `data:image/${getImageExtension(data.ProfilePicture)};base64,${data.ProfilePicture}`
                            })
                        } else {
                            setMessage('No agent has been found...')
                            setQuery('')
                            setValid(false)
                        }
                        setLoading(false)
                    }
                );
            },
            5000
        );
    }

    return (
        <div className={`${wrapper.fluid} ${wrapper.vw100} ${wrapper.vh100} ${wrapper.middle} ${wrapper.center}
        ${appTheme === 'dark' ? theme.dark : theme.light } `}>
            <Dialog
                hidden={!agent && !message}
                onDismiss={() => setAgent(null)}
                dialogContentProps={{ ...dialogContentProps, subText: message }}
                modalProps={modalProps}
                styles={dialogStyles}
            >

                {agent &&
                    <img src={agent.ProfilePicture} alt={agent.FileAs} style={{ width: 120, height: 120, borderRadius: '50%' }}/>
                }

                <DialogFooter>
                    <PrimaryButton onClick={() => {
                        if (query) setQuery('')
                        if (valid) setValid(false)
                        if (agent) setAgent(null)
                        if (message) setMessage(undefined)
                    }} text="OK" />
                </DialogFooter>
            </Dialog>

            <div style={{ width: '50vw'}}>
                {(!agent) &&
                    <>
                        {(!loading) &&
                            <>
                                <Form width={'100%'} style={{ maxWidth: 190 }}>
                                    <>
                                        <TextField width={'250px'}
                                                   type="email"
                                                   name="email"
                                                   label={'E-mail'}
                                                   ariaLabel={"Required e-mail address field"}
                                                   placeholder={'johnny@apple.seed'}
                                                   onChange={(e) => {
                                                       const value = (e.target as HTMLInputElement).value
                                                       value.length !==0 ? setValid(email.test(value)) : setValid(false)
                                                       setQuery(value)
                                                   }}
                                                   required />
                                            <div style={{ minHeight: '23.64px'}}>
                                                {!valid && query.length !==0 &&
                                                    <span style={{ fontSize: '0.8rem', color: '#a4262c' }}>Such e-mail address isn't valid.</span>
                                                }
                                            </div>
                                    </>
                                </Form>
                                <span className={'block'} style={{ fontSize: '0.8rem' }}><b>Hint:</b>&nbsp;Enter <i>mroyster@royster.com</i> and hit submit to proceed.</span>
                                <div className={wrapper.fluid} style={{ justifyContent: 'flex-end' }}>
                                    <PrimaryButton text="Submit"
                                                   style={{ float: 'right' }}
                                                   allowDisabledFocus
                                                   {...(valid && { onClick: findContact })}
                                                   {...(!valid && { disabled: true })}
                                    />
                                </div>
                            </>
                        }
                        {(loading) &&
                            <div style={{ width: '50vw' }}>
                                <ProgressIndicator label="Loading Agent Details" description="This tape will be destroyed after watching." />
                            </div>
                        }
                    </>
                }
            </div>

            <Footer>
                <>
                    <span>Switch to</span>&nbsp;<PrimaryButton text={appTheme === 'dark' ? 'light' : 'dark' }
                                   style={{ textTransform: 'capitalize', background: '#f61c54', border: '1px solid #f61c54' }}
                                   onClick={() => setAppTheme(appTheme === 'dark' ? 'light' : 'dark' )}
                                   allowDisabledFocus
                    />&nbsp;<span>app theme.</span>
                </>
            </Footer>
        </div>
    );
}

export default App;
