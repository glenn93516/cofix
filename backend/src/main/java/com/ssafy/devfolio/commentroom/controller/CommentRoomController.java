package com.ssafy.devfolio.commentroom.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.ssafy.devfolio.commentroom.CommentRoom;
import com.ssafy.devfolio.commentroom.dto.ChannelDto;
import com.ssafy.devfolio.commentroom.dto.CreateCommentRoomRequest;
import com.ssafy.devfolio.pubsub.RedisListenerService;
import com.ssafy.devfolio.pubsub.RedisSenderService;
import com.ssafy.devfolio.commentroom.service.CommentRoomService;
import com.ssafy.devfolio.exception.BaseException;
import com.ssafy.devfolio.exception.ErrorCode;
import com.ssafy.devfolio.response.ResponseService;
import com.ssafy.devfolio.response.dto.BaseResponse;
import com.ssafy.devfolio.response.dto.ListDataResponse;
import com.ssafy.devfolio.response.dto.SingleDataResponse;
import io.swagger.annotations.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.ssafy.devfolio.utils.Utility.getMemberIdFromAuthentication;

@RestController
@RequiredArgsConstructor
@RequestMapping("/commentRooms")
@Api(value = "첨삭방 api")
public class CommentRoomController {

    private final Map<String, ChannelTopic> channels;
    private final CommentRoomService commentRoomService;
    private final RedisSenderService redisSenderService;
    private final ResponseService responseService;
    private final RedisListenerService redisListenerService;

    @ApiImplicitParams({
            @ApiImplicitParam(name = "Authorization", value = "로그인 성공 후 발급받는 Bearer token", required = true, dataType = "String", paramType = "header")
    })
    @ApiOperation(value = "첨삭방 생성")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping
    public ResponseEntity createCommentRoom(@ApiParam(value = "첨삭방 생성 정보", required = true) @RequestBody CreateCommentRoomRequest request) throws JsonProcessingException {

        Long memberId = getMemberIdFromAuthentication();

        if (request.getMemberLimit() <= 0) {
            throw new BaseException(ErrorCode.COMMENT_ROOM_INVALID_MEMBER_LIMIT);
        }

        CommentRoom commentRoom = commentRoomService.createCommentRoom(request, memberId);

        redisListenerService.createRoomTopic(commentRoom.getRoomId());

        SingleDataResponse<CommentRoom> response = responseService.getSingleDataResponse(commentRoom, HttpStatus.CREATED);

        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @ApiImplicitParams({
            @ApiImplicitParam(name = "Authorization", value = "로그인 성공 후 발급받는 Bearer token", required = true, dataType = "String", paramType = "header")
    })
    @ApiOperation(value = "첨삭방 종료", notes = "개설자만 종료 가능")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PatchMapping("/{commentRoomId}")
    public ResponseEntity closeCommentRoom(@ApiParam(value = "첨삭방 id", required = true) @PathVariable String commentRoomId) throws JsonProcessingException {
        Long memberId = getMemberIdFromAuthentication();

        commentRoomService.closeCommentRoom(commentRoomId, memberId);

        BaseResponse response = responseService.getSuccessResponse();

        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @ApiOperation(value = "핀번호로 첨삭방 조회")
    @GetMapping("/{pinNumber}")
    public ResponseEntity getCommentRoom(@ApiParam(value = "핀번호", required = true) @PathVariable String pinNumber) throws JsonProcessingException {
        CommentRoom commentRoom = commentRoomService.getCommentRoom(pinNumber);

        SingleDataResponse<CommentRoom> response = responseService.getSingleDataResponse(commentRoom, HttpStatus.OK);

        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @ApiOperation(value = "첨삭방 입장", notes = "사용자 닉네임 입력해야함, 수정 후 room 채널 구독자에게 변경내역 보냄")
    @GetMapping("/enter/{pinNumber}")
    public ResponseEntity enterCommentRoom(@ApiParam(value = "핀번호", required = true) @PathVariable String pinNumber,
                                           @ApiParam(value = "닉네임", required = true, defaultValue = "") @RequestParam String nickname) throws JsonProcessingException {
        if ( nickname == null || nickname.equals("") ) {
            throw new BaseException(ErrorCode.COMMENT_ROOM_INVALID_NICKNAME);
        }
        CommentRoom commentRoom = commentRoomService.enterCommentRoom(pinNumber, nickname);

        redisListenerService.createRoomTopic(commentRoom.getRoomId());

        SingleDataResponse<CommentRoom> response = responseService.getSingleDataResponse(commentRoom, HttpStatus.OK);

        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @ApiImplicitParams({
            @ApiImplicitParam(name = "Authorization", value = "로그인 성공 후 발급받는 Bearer token", required = true, dataType = "String", paramType = "header")
    })
    @ApiOperation(value = "첨삭방 정보 수정", notes = "개설자만 정보(제목, 인원제한) 수정 가능, 수정 후 room 채널 구독자에게 변경내역 보냄")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PutMapping("/{commentRoomId}")
    public ResponseEntity fixCommentRoomInfo(@ApiParam(value = "첨삭방 id", required = true) @PathVariable String commentRoomId,
                                             @ApiParam(value = "수정할 방 제목", required = false) @RequestParam(value = "roomTitle", required = false) String roomTitle,
                                             @ApiParam(value = "수정할 인원 제한(1 이상 정수)", required = false) @RequestParam(value = "memberLimit", required = false, defaultValue = "0") int memberLimit) throws JsonProcessingException {

        Long memberId = getMemberIdFromAuthentication();

        if (roomTitle != null) {
            CommentRoom commentRoom = commentRoomService.fixRoomTitle(commentRoomId, roomTitle, memberId);
            redisSenderService.sendRoomUpdateService(commentRoom);
        }
        if (memberLimit != 0) {
            CommentRoom commentRoom = commentRoomService.fixMemberLimit(commentRoomId, memberLimit, memberId);
            redisSenderService.sendRoomUpdateService(commentRoom);
        }

        BaseResponse response = responseService.getSuccessResponse();

        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @ApiOperation(value = "현재 존재하는 채널 확인 (데이터 검사용도)")
    @GetMapping("/channels")
    public ResponseEntity getChannels() {
        List<ChannelDto> list = new ArrayList<>();
        for (Map.Entry<String, ChannelTopic> channel : channels.entrySet()) {
            list.add(new ChannelDto(channel.getKey(), channel.getValue()));
        }

        ListDataResponse<ChannelDto> response = responseService.getListDataResponse(list, HttpStatus.OK);

        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
