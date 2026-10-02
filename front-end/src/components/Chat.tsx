// src/components/Chat.tsx
const Chat = (): React.ReactElement => {
    return (

        <div className="card bg-base-200 p-4 shadow-md">
            <div className="flex-1 overflow-y-auto text-sm text-gray-500 mb-2">
            
            <div class="aura aura-glow">
                <div class="card bg-base-100">
                    <div class="card-body">
            <div className="avatar-group -space-x-6">
                <div className="avatar">
                    <div className="w-12">
                        <img alt="Tailwind-CSS-Avatar-component" src="https://img.daisyui.com/images/profile/demo/batperson@192.webp" />
                    </div>
                </div>
                <div className="avatar">
                    <div className="w-12">
                        <img alt="Tailwind-CSS-Avatar-component" src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp" />
                    </div>
                </div>
                <div className="avatar">
                    <div className="w-12">
                        <img alt="Tailwind-CSS-Avatar-component" src="https://img.daisyui.com/images/profile/demo/averagebulk@192.webp" />
                    </div>
                </div>
                <div className="avatar avatar-placeholder">
                    <div className="bg-neutral text-neutral-content w-12">
                    <span>+99</span>
                    </div>
                </div>
                </div>
            
                    <div className="chat chat-start">
                        <div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
                    </div>
                    <div className="chat chat-start">
                        <div className="chat-bubble chat-bubble-secondary">
                            Put me on the Council and not make me a Master!??
                        </div>
                    </div>
                    <div className="chat chat-start">
                      <div className="chat-bubble chat-bubble-accent">
                        That's never been done in the history of the Jedi.
                      </div>
                    </div>
                    <div className="chat chat-start">
                      <div className="chat-bubble chat-bubble-neutral">It's insulting!</div>
                    </div>
                    <div className="chat chat-end">
                      <div className="chat-bubble chat-bubble-info">Calm down, Anakin.</div>
                    </div>
                    <div className="chat chat-end">
                      <div className="chat-bubble chat-bubble-success">You have been given a great honor.</div>
                    </div>
                    <div className="chat chat-end">
                      <div className="chat-bubble chat-bubble-warning">To be on the Council at your age.</div>
                    </div>
                    <div className="chat chat-end">
                      <div className="chat-bubble chat-bubble-error">It's never happened before.</div>
                    </div>
                    <div className="chat chat-start">
                    <div className="chat-bubble chat-bubble-info">
                        <span className="loading loading-dots loading-xl"></span>
                    </div>
                    </div>
            
                <fieldset className="fieldset">
                    <div className="flex gap-2">
                        <input type="text" placeholder="Type here" className="input" />
            <button className="btn btn-soft btn-secondary" onClick={()=>{ return} } >Envoyer</button>
                    </div>
                </fieldset>
            
                  </div>
                </div>
            </div>
            </div>
        </div>
            
    );
};
export default Chat;
