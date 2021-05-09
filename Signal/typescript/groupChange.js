require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const missingCaseError_1 = require("./util/missingCaseError");
    function renderChange(change, options) {
        const { details, from } = change;
        return details.map((detail) => renderChangeDetail(detail, Object.assign(Object.assign({}, options), { from })));
    }
    exports.renderChange = renderChange;
    // tslint:disable-next-line cyclomatic-complexity max-func-body-length
    function renderChangeDetail(detail, options) {
        const { AccessControlEnum, from, i18n, ourConversationId, renderContact, renderString, RoleEnum, } = options;
        const fromYou = Boolean(from && from === ourConversationId);
        if (detail.type === 'title') {
            const { newTitle } = detail;
            if (newTitle) {
                if (fromYou) {
                    return renderString('GroupV2--title--change--you', i18n, [newTitle]);
                }
                else if (from) {
                    return renderString('GroupV2--title--change--other', i18n, {
                        memberName: renderContact(from),
                        newTitle,
                    });
                }
                else {
                    return renderString('GroupV2--title--change--unknown', i18n, [
                        newTitle,
                    ]);
                }
            }
            else {
                if (fromYou) {
                    return renderString('GroupV2--title--remove--you', i18n);
                }
                else if (from) {
                    return renderString('GroupV2--title--remove--other', i18n, [
                        renderContact(from),
                    ]);
                }
                else {
                    return renderString('GroupV2--title--remove--unknown', i18n);
                }
            }
        }
        else if (detail.type === 'avatar') {
            if (detail.removed) {
                if (fromYou) {
                    return renderString('GroupV2--avatar--remove--you', i18n);
                }
                else if (from) {
                    return renderString('GroupV2--avatar--remove--other', i18n, [
                        renderContact(from),
                    ]);
                }
                else {
                    return renderString('GroupV2--avatar--remove--unknown', i18n);
                }
            }
            else {
                if (fromYou) {
                    return renderString('GroupV2--avatar--change--you', i18n);
                }
                else if (from) {
                    return renderString('GroupV2--avatar--change--other', i18n, [
                        renderContact(from),
                    ]);
                }
                else {
                    return renderString('GroupV2--avatar--change--unknown', i18n);
                }
            }
        }
        else if (detail.type === 'access-attributes') {
            const { newPrivilege } = detail;
            if (newPrivilege === AccessControlEnum.ADMINISTRATOR) {
                if (fromYou) {
                    return renderString('GroupV2--access-attributes--admins--you', i18n);
                }
                else if (from) {
                    return renderString('GroupV2--access-attributes--admins--other', i18n, [
                        renderContact(from),
                    ]);
                }
                else {
                    return renderString('GroupV2--access-attributes--admins--unknown', i18n);
                }
            }
            else if (newPrivilege === AccessControlEnum.MEMBER) {
                if (fromYou) {
                    return renderString('GroupV2--access-attributes--all--you', i18n);
                }
                else if (from) {
                    return renderString('GroupV2--access-attributes--all--other', i18n, [
                        renderContact(from),
                    ]);
                }
                else {
                    return renderString('GroupV2--access-attributes--all--unknown', i18n);
                }
            }
            else {
                throw new Error(`access-attributes change type, privilege ${newPrivilege} is unknown`);
            }
        }
        else if (detail.type === 'access-members') {
            const { newPrivilege } = detail;
            if (newPrivilege === AccessControlEnum.ADMINISTRATOR) {
                if (fromYou) {
                    return renderString('GroupV2--access-members--admins--you', i18n);
                }
                else if (from) {
                    return renderString('GroupV2--access-members--admins--other', i18n, [
                        renderContact(from),
                    ]);
                }
                else {
                    return renderString('GroupV2--access-members--admins--unknown', i18n);
                }
            }
            else if (newPrivilege === AccessControlEnum.MEMBER) {
                if (fromYou) {
                    return renderString('GroupV2--access-members--all--you', i18n);
                }
                else if (from) {
                    return renderString('GroupV2--access-members--all--other', i18n, [
                        renderContact(from),
                    ]);
                }
                else {
                    return renderString('GroupV2--access-members--all--unknown', i18n);
                }
            }
            else {
                throw new Error(`access-members change type, privilege ${newPrivilege} is unknown`);
            }
        }
        else if (detail.type === 'member-add') {
            const { conversationId } = detail;
            const weAreJoiner = conversationId === ourConversationId;
            if (weAreJoiner) {
                if (fromYou) {
                    return renderString('GroupV2--member-add--you--you', i18n);
                }
                else if (from) {
                    return renderString('GroupV2--member-add--you--other', i18n, [
                        renderContact(from),
                    ]);
                }
                else {
                    return renderString('GroupV2--member-add--you--unknown', i18n);
                }
            }
            else {
                if (fromYou) {
                    return renderString('GroupV2--member-add--other--you', i18n, [
                        renderContact(conversationId),
                    ]);
                }
                else if (from) {
                    return renderString('GroupV2--member-add--other--other', i18n, {
                        adderName: renderContact(from),
                        addeeName: renderContact(conversationId),
                    });
                }
                else {
                    return renderString('GroupV2--member-add--other--unknown', i18n, [
                        renderContact(conversationId),
                    ]);
                }
            }
        }
        else if (detail.type === 'member-add-from-invite') {
            const { conversationId, inviter } = detail;
            const weAreJoiner = conversationId === ourConversationId;
            const weAreInviter = Boolean(inviter && inviter === ourConversationId);
            if (weAreJoiner) {
                return renderString('GroupV2--member-add--from-invite--you', i18n, [
                    renderContact(inviter),
                ]);
            }
            else if (weAreInviter) {
                return renderString('GroupV2--member-add--from-invite--from-you', i18n, [
                    renderContact(conversationId),
                ]);
            }
            else {
                return renderString('GroupV2--member-add--from-invite--other', i18n, {
                    inviteeName: renderContact(conversationId),
                    inviterName: renderContact(inviter),
                });
            }
        }
        else if (detail.type === 'member-remove') {
            const { conversationId } = detail;
            const weAreLeaver = conversationId === ourConversationId;
            if (weAreLeaver) {
                if (fromYou) {
                    return renderString('GroupV2--member-remove--you--you', i18n);
                }
                else if (from) {
                    return renderString('GroupV2--member-remove--you--other', i18n, [
                        renderContact(from),
                    ]);
                }
                else {
                    return renderString('GroupV2--member-remove--you--unknown', i18n);
                }
            }
            else {
                if (fromYou) {
                    return renderString('GroupV2--member-remove--other--you', i18n, [
                        renderContact(conversationId),
                    ]);
                }
                else if (from && from === conversationId) {
                    return renderString('GroupV2--member-remove--other--self', i18n, [
                        renderContact(from),
                    ]);
                }
                else if (from) {
                    return renderString('GroupV2--member-remove--other--other', i18n, {
                        adminName: renderContact(from),
                        memberName: renderContact(conversationId),
                    });
                }
                else {
                    return renderString('GroupV2--member-remove--other--unknown', i18n, [
                        renderContact(conversationId),
                    ]);
                }
            }
        }
        else if (detail.type === 'member-privilege') {
            const { conversationId, newPrivilege } = detail;
            const weAreMember = conversationId === ourConversationId;
            if (newPrivilege === RoleEnum.ADMINISTRATOR) {
                if (weAreMember) {
                    if (from) {
                        return renderString('GroupV2--member-privilege--promote--you--other', i18n, [renderContact(from)]);
                    }
                    else {
                        return renderString('GroupV2--member-privilege--promote--you--unknown', i18n);
                    }
                }
                else {
                    if (fromYou) {
                        return renderString('GroupV2--member-privilege--promote--other--you', i18n, [renderContact(conversationId)]);
                    }
                    else if (from) {
                        return renderString('GroupV2--member-privilege--promote--other--other', i18n, {
                            adminName: renderContact(from),
                            memberName: renderContact(conversationId),
                        });
                    }
                    else {
                        return renderString('GroupV2--member-privilege--promote--other--unknown', i18n, [renderContact(conversationId)]);
                    }
                }
            }
            else if (newPrivilege === RoleEnum.DEFAULT) {
                if (weAreMember) {
                    if (from) {
                        return renderString('GroupV2--member-privilege--demote--you--other', i18n, [renderContact(from)]);
                    }
                    else {
                        return renderString('GroupV2--member-privilege--demote--you--unknown', i18n);
                    }
                }
                else {
                    if (fromYou) {
                        return renderString('GroupV2--member-privilege--demote--other--you', i18n, [renderContact(conversationId)]);
                    }
                    else if (from) {
                        return renderString('GroupV2--member-privilege--demote--other--other', i18n, {
                            adminName: renderContact(from),
                            memberName: renderContact(conversationId),
                        });
                    }
                    else {
                        return renderString('GroupV2--member-privilege--demote--other--unknown', i18n, [renderContact(conversationId)]);
                    }
                }
            }
            else {
                throw new Error(`member-privilege change type, privilege ${newPrivilege} is unknown`);
            }
        }
        else if (detail.type === 'pending-add-one') {
            const { conversationId } = detail;
            const weAreInvited = conversationId === ourConversationId;
            if (weAreInvited) {
                if (from) {
                    return renderString('GroupV2--pending-add--one--you--other', i18n, [
                        renderContact(from),
                    ]);
                }
                else {
                    return renderString('GroupV2--pending-add--one--you--unknown', i18n);
                }
            }
            else {
                if (fromYou) {
                    return renderString('GroupV2--pending-add--one--other--you', i18n, [
                        renderContact(conversationId),
                    ]);
                }
                else if (from) {
                    return renderString('GroupV2--pending-add--one--other--other', i18n, [
                        renderContact(from),
                    ]);
                }
                else {
                    return renderString('GroupV2--pending-add--one--other--unknown', i18n);
                }
            }
        }
        else if (detail.type === 'pending-add-many') {
            const { count } = detail;
            if (fromYou) {
                return renderString('GroupV2--pending-add--many--you', i18n, [
                    count.toString(),
                ]);
            }
            else if (from) {
                return renderString('GroupV2--pending-add--many--other', i18n, {
                    memberName: renderContact(from),
                    count: count.toString(),
                });
            }
            else {
                return renderString('GroupV2--pending-add--many--unknown', i18n, [
                    count.toString(),
                ]);
            }
        }
        else if (detail.type === 'pending-remove-one') {
            const { inviter, conversationId } = detail;
            const weAreInviter = Boolean(inviter && inviter === ourConversationId);
            const sentByInvited = Boolean(from && from === conversationId);
            if (weAreInviter) {
                if (inviter && sentByInvited) {
                    return renderString('GroupV2--pending-remove--decline--you', i18n, [
                        renderContact(conversationId),
                    ]);
                }
                else if (fromYou) {
                    return renderString('GroupV2--pending-remove--revoke-invite-from-you--one--you', i18n, [renderContact(conversationId)]);
                }
                else if (from) {
                    return renderString('GroupV2--pending-remove--revoke-invite-from-you--one--other', i18n, {
                        adminName: renderContact(from),
                        inviteeName: renderContact(conversationId),
                    });
                }
                else {
                    return renderString('GroupV2--pending-remove--revoke-invite-from-you--one--unknown', i18n, [renderContact(conversationId)]);
                }
            }
            else if (sentByInvited) {
                if (inviter) {
                    return renderString('GroupV2--pending-remove--decline--other', i18n, [
                        renderContact(inviter),
                    ]);
                }
                else {
                    return renderString('GroupV2--pending-remove--decline--unknown', i18n);
                }
            }
            else if (inviter) {
                if (fromYou) {
                    return renderString('GroupV2--pending-remove--revoke-invite-from--one--you', i18n, [renderContact(inviter)]);
                }
                else if (from) {
                    return renderString('GroupV2--pending-remove--revoke-invite-from--one--other', i18n, {
                        adminName: renderContact(from),
                        memberName: renderContact(inviter),
                    });
                }
                else {
                    return renderString('GroupV2--pending-remove--revoke-invite-from--one--unknown', i18n, [renderContact(inviter)]);
                }
            }
            else {
                if (fromYou) {
                    return renderString('GroupV2--pending-remove--revoke--one--you', i18n);
                }
                else if (from) {
                    return renderString('GroupV2--pending-remove--revoke--one--other', i18n, [renderContact(from)]);
                }
                else {
                    return renderString('GroupV2--pending-remove--revoke--one--unknown', i18n);
                }
            }
        }
        else if (detail.type === 'pending-remove-many') {
            const { count, inviter } = detail;
            const weAreInviter = Boolean(inviter && inviter === ourConversationId);
            if (weAreInviter) {
                if (fromYou) {
                    return renderString('GroupV2--pending-remove--revoke-invite-from-you--many--you', i18n, [count.toString()]);
                }
                else if (from) {
                    return renderString('GroupV2--pending-remove--revoke-invite-from-you--many--other', i18n, {
                        adminName: renderContact(from),
                        count: count.toString(),
                    });
                }
                else {
                    return renderString('GroupV2--pending-remove--revoke-invite-from-you--many--unknown', i18n, [count.toString()]);
                }
            }
            else if (inviter) {
                if (fromYou) {
                    return renderString('GroupV2--pending-remove--revoke-invite-from--many--you', i18n, {
                        count: count.toString(),
                        memberName: renderContact(inviter),
                    });
                }
                else if (from) {
                    return renderString('GroupV2--pending-remove--revoke-invite-from--many--other', i18n, {
                        adminName: renderContact(from),
                        count: count.toString(),
                        memberName: renderContact(inviter),
                    });
                }
                else {
                    return renderString('GroupV2--pending-remove--revoke-invite-from--many--unknown', i18n, {
                        count: count.toString(),
                        memberName: renderContact(inviter),
                    });
                }
            }
            else {
                if (fromYou) {
                    return renderString('GroupV2--pending-remove--revoke--many--you', i18n, [count.toString()]);
                }
                else if (from) {
                    return renderString('GroupV2--pending-remove--revoke--many--other', i18n, {
                        memberName: renderContact(from),
                        count: count.toString(),
                    });
                }
                else {
                    return renderString('GroupV2--pending-remove--revoke--many--unknown', i18n, [count.toString()]);
                }
            }
        }
        else {
            throw missingCaseError_1.missingCaseError(detail);
        }
    }
    exports.renderChangeDetail = renderChangeDetail;
});